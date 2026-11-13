/**
 * PWA Service Worker & App Installation Handler
 */

export function setupPWA() {
  let deferredPrompt = null;
  const installBtn = document.getElementById('btn-pwa-install');

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default Chrome mini-infobar
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        alert('BitMiner is already installed or your browser doesn\'t support automatic PWA installation.');
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA user install outcome: ${outcome}`);
      deferredPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('BitMiner successfully installed to device.');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });

  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swCode = `
        const CACHE_NAME = 'bitminer-v1';
        self.addEventListener('install', (e) => {
          self.skipWaiting();
        });
        self.addEventListener('activate', (e) => {
          e.waitUntil(clients.claim());
        });
        self.addEventListener('fetch', (e) => {
          e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
        });
      `;
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      navigator.serviceWorker.register(swUrl).catch((err) => {
        console.warn('Service worker registration error:', err);
      });
    });
  }
}
