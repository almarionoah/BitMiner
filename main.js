/* BitMiner Application Logic */
import './style.css';

// Core State Variables required by data contract
let miner_identity_email = '';
let blab = '';
let app_user_selected_amount = 0.050;

// Application State
let isMining = false;
let miningInterval = null;
let blockCounter = 0;
let pendingBlabs = [];
let convertedBlabs = [];
let totalYieldBtc = 0;
let deferredInstallPrompt = null;

// Base64 Helpers
const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
const fromBase64 = (b64) => {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    return b64;
  }
};

// Initialize Identity Email in Base64
function generateBase64Identity() {
  const randomId = Math.random().toString(36).substring(2, 8);
  const rawEmail = `miner.${randomId}@bitminer.network`;
  miner_identity_email = toBase64(rawEmail);
  return miner_identity_email;
}

// Generate Base64 Key Value (blab)
function generateBase64Blab() {
  const timestamp = Date.now();
  const nonce = Math.floor(Math.random() * 1000000);
  const rawBlockStr = `BLK:${timestamp}:${nonce}`;
  blab = toBase64(rawBlockStr);
  return blab;
}

// Terminal Feed Logger
function logToTerminal(message, type = 'info') {
  const terminal = document.getElementById('feed-terminal');
  if (!terminal) return;
  
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  const time = new Date().toISOString().split('T')[1].slice(0, 8);
  line.textContent = `[${time}] ${message}`;
  
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

// Conversion Processing Algorithm
function processBlabConversion(targetBlab, selectedAmount) {
  if (!targetBlab) return null;
  
  // Convert using core variables: blab, miner_identity_email, app_user_selected_amount
  const identityDecoded = fromBase64(miner_identity_email);
  const blabDecoded = fromBase64(targetBlab);
  const convertedVal = parseFloat(selectedAmount) || 0.05;
  
  // Combined verification hash simulation
  const verificationSignature = toBase64(`${miner_identity_email}:${targetBlab}:${convertedVal}`);
  
  const record = {
    blab: targetBlab,
    miner_identity_email: miner_identity_email,
    app_user_selected_amount: convertedVal,
    signature: verificationSignature,
    convertedAt: new Date().toLocaleTimeString()
  };
  
  convertedBlabs.push(record);
  totalYieldBtc += convertedVal;
  
  // Output response to feed terminal
  logToTerminal(
    `[CONVERTED] blab:${targetBlab.substring(0, 16)}... | identity:${miner_identity_email.substring(0, 12)}... | amount:${convertedVal} BTC | sig:${verificationSignature.substring(0, 14)}...`,
    'convert'
  );
  
  updateConvertUI();
  return record;
}

// Mining Interval Loop
function startMining() {
  if (isMining) return;
  isMining = true;
  
  const startBtn = document.getElementById('start-mine-btn');
  if (startBtn) {
    startBtn.classList.add('active');
    startBtn.innerHTML = '<span class="btn-text">⏹️ Stop Mining</span>';
  }
  
  logToTerminal(`[MINER] Session started for miner_identity_email: ${miner_identity_email}`, 'success');
  
  miningInterval = setInterval(() => {
    // 1. Generate new blab
    const newBlab = generateBase64Blab();
    blockCounter++;
    pendingBlabs.push(newBlab);
    
    // 2. Hashrate simulation update
    const simulatedHashrate = (45.2 + Math.random() * 12.8).toFixed(2);
    document.getElementById('hashrate-val').textContent = `${simulatedHashrate} MH/s`;
    document.getElementById('latest-blab-display').textContent = newBlab;
    document.getElementById('blocks-count-val').textContent = blockCounter;
    document.getElementById('pending-count-val').textContent = pendingBlabs.length;
    
    logToTerminal(`[MINED] New base64 block generated [blab]: ${newBlab}`, 'info');
    
    // 3. Auto-convert if enabled
    const autoConvertToggle = document.getElementById('auto-convert-toggle');
    if (autoConvertToggle && autoConvertToggle.checked) {
      const blabToProcess = pendingBlabs.shift();
      const currentAmountInput = document.getElementById('selected-amount-input');
      app_user_selected_amount = parseFloat(currentAmountInput.value) || 0.05;
      processBlabConversion(blabToProcess, app_user_selected_amount);
      document.getElementById('pending-count-val').textContent = pendingBlabs.length;
    }
    
    renderBlocksList();
  }, 2500);
}

function stopMining() {
  isMining = false;
  if (miningInterval) clearInterval(miningInterval);
  miningInterval = null;
  
  const startBtn = document.getElementById('start-mine-btn');
  if (startBtn) {
    startBtn.innerHTML = '<span class="btn-text">Start Mining</span>';
  }
  document.getElementById('hashrate-val').textContent = '0.00 MH/s';
  logToTerminal('[MINER] Mining loop paused.', 'warn');
}

// UI Renderers
function renderBlocksList() {
  const listEl = document.getElementById('blocks-list');
  const queueBadge = document.getElementById('queue-badge');
  if (!listEl) return;
  
  queueBadge.textContent = `${pendingBlabs.length} items`;
  
  if (pendingBlabs.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No unconverted BLAB blocks in queue.</div>';
    return;
  }
  
  listEl.innerHTML = pendingBlabs.map((b, idx) => `
    <div class="block-item">
      <span class="blab-key">blab #${idx + 1}: ${b}</span>
      <span class="timestamp">Ready</span>
    </div>
  `).join('');
}

function updateConvertUI() {
  const totalConvertedVal = document.getElementById('total-converted-val');
  const totalYieldVal = document.getElementById('total-yield-val');
  const historyEl = document.getElementById('converted-history');
  
  if (totalConvertedVal) totalConvertedVal.textContent = `${convertedBlabs.length} BLABs`;
  if (totalYieldVal) totalYieldVal.textContent = `${totalYieldBtc.toFixed(4)} BTC`;
  
  if (historyEl) {
    if (convertedBlabs.length === 0) {
      historyEl.innerHTML = '<div class="empty-state">No conversions processed yet.</div>';
    } else {
      historyEl.innerHTML = [...convertedBlabs].reverse().map((item) => `
        <div class="history-item">
          <span class="blab-key" title="${item.blab}">blab: ${item.blab.substring(0, 16)}...</span>
          <span class="timestamp">+${item.app_user_selected_amount} BTC (${item.convertedAt})</span>
        </div>
      `).join('');
    }
  }
}

// Tab Navigation
function initNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const tabTarget = btn.getAttribute('data-tab');
      const pane = document.getElementById(`tab-${tabTarget}`);
      if (pane) pane.classList.add('active');
    });
  });
}

// Event Setup
function setupEventListeners() {
  // Miner Identity setup
  generateBase64Identity();
  const emailDisplay = document.getElementById('miner-email-display');
  const emailInput = document.getElementById('miner-identity-input');
  if (emailDisplay) emailDisplay.textContent = miner_identity_email;
  if (emailInput) emailInput.value = miner_identity_email;
  
  // Start / Stop Mining
  const startBtn = document.getElementById('start-mine-btn');
  startBtn?.addEventListener('click', () => {
    if (isMining) stopMining();
    else startMining();
  });
  
  // Clear Unconverted Queue
  document.getElementById('clear-blocks-btn')?.addEventListener('click', () => {
    pendingBlabs = [];
    document.getElementById('pending-count-val').textContent = '0';
    renderBlocksList();
    logToTerminal('[QUEUE] Unconverted blab queue cleared by user.', 'warn');
  });
  
  // Manual Conversion Trigger
  document.getElementById('manual-convert-btn')?.addEventListener('click', () => {
    const amountInput = document.getElementById('selected-amount-input');
    app_user_selected_amount = parseFloat(amountInput.value) || 0.05;
    
    if (pendingBlabs.length === 0) {
      // Generate temporary blab if queue is empty for immediate conversion
      const tempBlab = generateBase64Blab();
      processBlabConversion(tempBlab, app_user_selected_amount);
    } else {
      while (pendingBlabs.length > 0) {
        const blabToConvert = pendingBlabs.shift();
        processBlabConversion(blabToConvert, app_user_selected_amount);
      }
      renderBlocksList();
      document.getElementById('pending-count-val').textContent = '0';
    }
  });
  
  // Amount input change binding
  document.getElementById('selected-amount-input')?.addEventListener('change', (e) => {
    app_user_selected_amount = parseFloat(e.target.value) || 0.05;
    logToTerminal(`[CONFIG] app_user_selected_amount updated to ${app_user_selected_amount} BTC`, 'info');
  });
  
  // Clear Terminal
  document.getElementById('clear-terminal-btn')?.addEventListener('click', () => {
    const terminal = document.getElementById('feed-terminal');
    if (terminal) {
      terminal.innerHTML = '<div class="terminal-line info">[SYSTEM] Terminal feed cleared.</div>';
    }
  });
}

// PWA Service Worker Registration & Install Banner
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        logToTerminal(`[PWA] ServiceWorker registered successfully (Scope: ${reg.scope})`, 'info');
      }).catch(err => {
        console.warn('SW registration failed:', err);
      });
    });
  }
  
  const installBtn = document.getElementById('pwa-install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });
  
  installBtn?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      logToTerminal('[PWA] Application installed by user.', 'success');
    }
    deferredInstallPrompt = null;
    installBtn.classList.add('hidden');
  });
}

// App Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  setupEventListeners();
  initPWA();
  console.log('BitMiner application initialized');
});
