// BitMiner Application Engine
// Developed by Kaelen Thorne, Lyra Van Dyk, Mint Reyes

const STATE = {
  activeTab: 'mine',
  isMining: false,
  miningInterval: null,
  miningRate: 2000, // ms per mining cycle
  blabs: [],
  logs: [],
  walletBTC: 0.00000000,
  walletUSD: 0.00,
  btcExchangeRate: 64500.00,
  deferredPrompt: null
};

// Generate random email address and encode to base64
function generateBase64Email() {
  const domains = ['bitminer.net', 'cryptonode.io', 'hashpool.org', 'quantum.tech'];
  const randomPrefix = 'miner_' + Math.random().toString(36).substring(2, 9);
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const rawEmail = `${randomPrefix}@${randomDomain}`;
  const base64Email = btoa(rawEmail);
  return { rawEmail, base64Email };
}

// Generate random crypto key and encode to base64
function generateBase64Key() {
  const keyChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let rawKey = '';
  for (let i = 0; i < 32; i++) {
    rawKey += keyChars.charAt(Math.floor(Math.random() * keyChars.length));
  }
  const base64Key = btoa(rawKey);
  return { rawKey, base64Key };
}

// Add message to feed terminal
function logToTerminal(type, message, detail = '') {
  const timestamp = new Date().toLocaleTimeString();
  STATE.logs.unshift({ timestamp, type, message, detail, id: Date.now() + Math.random() });
  if (STATE.logs.length > 100) STATE.logs.pop();
  renderTerminal();
}

// Create a new blab block
function mineBlab() {
  const emailData = generateBase64Email();
  const keyData = generateBase64Key();
  const combinedBlab = `BLAB:${emailData.base64Email}.${keyData.base64Key}`;
  
  const blab = {
    id: 'BLAB-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    emailPlain: emailData.rawEmail,
    emailBase64: emailData.base64Email,
    keyBase64: keyData.base64Key,
    fullBlab: combinedBlab,
    amount: 100, // Default conversion weight/amount per user story requirement
    converted: false,
    btcEarned: 0,
    createdAt: new Date().toLocaleTimeString()
  };

  STATE.blabs.unshift(blab);
  logToTerminal(
    'mine',
    `Mined new Base64 Blab [${blab.id}]`,
    `Email: ${emailData.base64Email} | Key: ${keyData.base64Key}`
  );

  renderStats();
  renderView();
}

// Process conversion of a specific blab
function convertBlab(blabId) {
  const blab = STATE.blabs.find(b => b.id === blabId);
  if (!blab || blab.converted) return;

  const inputEl = document.getElementById(`amount-${blab.id}`);
  if (inputEl) {
    const newAmount = parseFloat(inputEl.value);
    if (!isNaN(newAmount) && newAmount > 0) {
      blab.amount = newAmount;
    }
  }

  // Conversion processing algorithm using each generated base64 blab
  const base64Factor = (blab.emailBase64.length + blab.keyBase64.length) / 100;
  const btcReward = parseFloat((blab.amount * 0.00000125 * base64Factor).toFixed(8));
  const usdReward = parseFloat((btcReward * STATE.btcExchangeRate).toFixed(2));

  blab.converted = true;
  blab.btcEarned = btcReward;

  STATE.walletBTC = parseFloat((STATE.walletBTC + btcReward).toFixed(8));
  STATE.walletUSD = parseFloat((STATE.walletUSD + usdReward).toFixed(2));

  logToTerminal(
    'convert',
    `Converted [${blab.id}] (Amount: ${blab.amount}) -> +${btcReward} BTC ($${usdReward})`,
    `Decoded Payload: ${blab.emailPlain} via base64 stream ${blab.fullBlab.substring(0, 24)}...`
  );

  renderStats();
  renderView();
}

// Convert all unconverted blabs
function convertAllBlabs() {
  const pending = STATE.blabs.filter(b => !b.converted);
  if (pending.length === 0) {
    logToTerminal('sys', 'No pending blabs available for conversion.');
    return;
  }
  pending.forEach(blab => convertBlab(blab.id));
}

// Render top stats counters
function renderStats() {
  const totalBlabs = STATE.blabs.length;
  const pendingBlabs = STATE.blabs.filter(b => !b.converted).length;
  
  document.getElementById('stat-blabs').textContent = totalBlabs;
  document.getElementById('stat-pending').textContent = pendingBlabs;
  document.getElementById('stat-btc').textContent = STATE.walletBTC.toFixed(8) + ' BTC';
  document.getElementById('stat-usd').textContent = '$' + STATE.walletUSD.toFixed(2);
}

// Render Feed Terminal
function renderTerminal() {
  const terminalEl = document.getElementById('terminal-logs');
  if (!terminalEl) return;

  if (STATE.logs.length === 0) {
    terminalEl.innerHTML = `<div class="empty-state">Terminal standing by... Start mining or conversion.</div>`;
    return;
  }

  terminalEl.innerHTML = STATE.logs.map(log => `
    <div class="log-entry ${log.type}">
      <span class="log-time">[${log.timestamp}]</span>
      <span class="log-tag ${log.type}">${log.type.toUpperCase()}</span>
      <span><strong>${log.message}</strong> ${log.detail ? `<br/><span style="opacity:0.75; font-size:0.75rem;">${log.detail}</span>` : ''}</span>
    </div>
  `).join('');
}

// Main UI View Renderer
function renderView() {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  if (STATE.activeTab === 'mine') {
    viewContainer.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">⚡ Base64 Mining Rig</h2>
          <div class="controls-row">
            <button id="btn-toggle-mine" class="btn ${STATE.isMining ? 'btn-danger' : 'btn-primary'}">
              ${STATE.isMining ? 'Stop Miner' : 'Start Auto Mine'}
            </button>
            <button id="btn-mine-once" class="btn btn-secondary">Mine Single Blab</button>
          </div>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Mining auto-generates valid email addresses and cryptographic key pairs encoded in base64 encryption to build unique Blabs.
        </p>
        <div class="blab-grid">
          ${STATE.blabs.slice(0, 6).map(blab => `
            <div class="blab-card">
              <div class="blab-header">
                <span class="blab-id">${blab.id}</span>
                <span>${blab.createdAt}</span>
              </div>
              <div class="blab-field">
                <span class="blab-label">Base64 Encrypted Email</span>
                <span class="blab-value">${blab.emailBase64}</span>
              </div>
              <div class="blab-field">
                <span class="blab-label">Base64 Key Value</span>
                <span class="blab-value">${blab.keyBase64}</span>
              </div>
            </div>
          `).join('')}
          ${STATE.blabs.length === 0 ? `<div class="empty-state" style="grid-column: 1 / -1;">No blabs mined yet. Click 'Start Auto Mine' or 'Mine Single Blab'.</div>` : ''}
        </div>
      </div>
    `;

    document.getElementById('btn-toggle-mine').addEventListener('click', () => {
      STATE.isMining = !STATE.isMining;
      if (STATE.isMining) {
        mineBlab();
        STATE.miningInterval = setInterval(mineBlab, STATE.miningRate);
        logToTerminal('sys', 'Auto mining engine activated.');
      } else {
        clearInterval(STATE.miningInterval);
        logToTerminal('sys', 'Auto mining engine paused.');
      }
      renderView();
    });

    document.getElementById('btn-mine-once').addEventListener('click', mineBlab);

  } else if (STATE.activeTab === 'convert') {
    const pendingBlabs = STATE.blabs.filter(b => !b.converted);
    
    viewContainer.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">🔄 Blab Converter & Processing Terminal</h2>
          <button id="btn-convert-all" class="btn btn-convert" ${pendingBlabs.length === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            Convert All Mined Blabs
          </button>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Specify the conversion input amount for each base64 blab below to process exchange rewards directly to the wallet.
        </p>
        <div class="blab-grid">
          ${STATE.blabs.map(blab => `
            <div class="blab-card" style="${blab.converted ? 'opacity: 0.7;' : ''}">
              <div class="blab-header">
                <span class="blab-id">${blab.id}</span>
                <span style="color:${blab.converted ? '#10b981' : '#f59e0b'}; font-weight:700;">
                  ${blab.converted ? `✅ CONVERTED (+${blab.btcEarned} BTC)` : '⏳ PENDING'}
                </span>
              </div>
              <div class="blab-field">
                <span class="blab-label">Combined Base64 String</span>
                <span class="blab-value">${blab.fullBlab}</span>
              </div>
              ${!blab.converted ? `
                <div class="blab-field">
                  <span class="blab-label">Conversion Input Amount</span>
                  <div class="amount-input-group">
                    <input type="number" id="amount-${blab.id}" class="input-number" value="${blab.amount}" min="1" max="10000" />
                    <button class="btn btn-convert btn-convert-single" data-id="${blab.id}">Convert</button>
                  </div>
                </div>
              ` : `
                <div class="blab-field">
                  <span class="blab-label">Decoded Email Source</span>
                  <span class="blab-value" style="color:#10b981;">${blab.emailPlain}</span>
                </div>
              `}
            </div>
          `).join('')}
          ${STATE.blabs.length === 0 ? `<div class="empty-state" style="grid-column: 1 / -1;">No blabs available. Go to 'Mine' tab to generate Base64 Blabs first.</div>` : ''}
        </div>
      </div>
    `;

    document.getElementById('btn-convert-all')?.addEventListener('click', convertAllBlabs);
    
    document.querySelectorAll('.btn-convert-single').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const blabId = e.currentTarget.getAttribute('data-id');
        convertBlab(blabId);
      });
    });
  }
}

// Render Full App Frame
function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="navbar">
      <div class="brand">
        <div class="brand-logo">⚡</div>
        <span class="brand-text">BitMiner</span>
      </div>
      <nav class="nav-tabs">
        <button class="tab-btn active" data-tab="mine">⛏️ Mine</button>
        <button class="tab-btn" data-tab="convert">🔄 Convert</button>
      </nav>
      <div class="header-actions">
        <button id="btn-pwa-install" class="btn-pwa" style="display:none;">
          📲 Install App
        </button>
      </div>
    </header>

    <section class="stats-bar">
      <div class="stat-card">
        <span class="stat-label">Total Blabs Mined</span>
        <span id="stat-blabs" class="stat-value">0</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Pending Conversions</span>
        <span id="stat-pending" class="stat-value">0</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Wallet Balance (BTC)</span>
        <span id="stat-btc" class="stat-value" style="color:#00f2fe;">0.00000000 BTC</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Estimated USD</span>
        <span id="stat-usd" class="stat-value" style="color:#10b981;">$0.00</span>
      </div>
    </section>

    <main id="view-container" class="main-layout"></main>

    <section class="terminal-panel">
      <div class="terminal-header">
        <div class="terminal-title">
          <span>💻</span>
          <span>FEED TERMINAL OUTPUT</span>
        </div>
        <button id="btn-clear-terminal" class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;">Clear Logs</button>
      </div>
      <div id="terminal-logs" class="terminal-body"></div>
    </section>
  `;

  // Navigation tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.getAttribute('data-tab');
      STATE.activeTab = targetTab;
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderView();
    });
  });

  // Clear terminal action
  document.getElementById('btn-clear-terminal').addEventListener('click', () => {
    STATE.logs = [];
    renderTerminal();
  });

  // Register Service Worker for PWA download capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    STATE.deferredPrompt = e;
    const pwaBtn = document.getElementById('btn-pwa-install');
    if (pwaBtn) {
      pwaBtn.style.display = 'inline-flex';
      pwaBtn.addEventListener('click', () => {
        STATE.deferredPrompt.prompt();
        STATE.deferredPrompt.userChoice.then(() => {
          STATE.deferredPrompt = null;
          pwaBtn.style.display = 'none';
        });
      });
    }
  });

  // Initial render & starter log
  logToTerminal('sys', 'BitMiner Core initialized. Select Mine or Convert tab to operate.');
  renderStats();
  renderView();
  renderTerminal();
}

// Start app after DOM ready
document.addEventListener('DOMContentLoaded', initApp);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initApp();
}
