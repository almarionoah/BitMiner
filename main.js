// BitMiner Core Application Module
// Lead Engineers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes

const state = {
  activeTab: 'mine', // 'mine' or 'convert'
  isMining: false,
  autoConvert: true,
  miner_identity_email: 'miner_node_' + Math.floor(Math.random() * 8999 + 1000) + '@bitminer.io',
  app_user_selected_amount: 0.0025,
  minedBlocksCount: 0,
  blabsGeneratedCount: 0,
  totalConvertedAmount: 0.0000,
  blabs: [], // stores core variable [blab] records
  miningInterval: null,
  deferredInstallPrompt: null
};

// Utility functions for base64 encoding and blab generation
function encodeBase64(str) {
  try {
    return btoa(str);
  } catch (e) {
    return btoa(encodeURIComponent(str));
  }
}

function generateBase64Key() {
  const randomArray = new Uint8Array(16);
  crypto.getRandomValues(randomArray);
  let binary = '';
  for (let i = 0; i < randomArray.length; i++) {
    binary += String.fromCharCode(randomArray[i]);
  }
  return btoa(binary);
}

function createBlabRecord(minerEmail) {
  const encryptedEmail = encodeBase64(minerEmail);
  const keyVal = generateBase64Key();
  // [blab] core variable combination
  const blab = `${encryptedEmail}:${keyVal}`;
  return {
    blab,
    encryptedEmail,
    keyVal,
    timestamp: new Date().toLocaleTimeString(),
    converted: false
  };
}

// PWA Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.deferredInstallPrompt = e;
  const pwaBtn = document.getElementById('pwa-install-btn');
  if (pwaBtn) pwaBtn.style.display = 'flex';
});

// Render App UI
function renderApp() {
  const appDiv = document.getElementById('app');
  if (!appDiv) return;

  const encryptedIdentity = encodeBase64(state.miner_identity_email);

  appDiv.innerHTML = `
    <header class="header">
      <div class="brand">
        <div class="brand-icon">⛏️</div>
        <div class="brand-title">BitMiner</div>
      </div>
      <nav class="nav-menu">
        <button class="nav-btn ${state.activeTab === 'mine' ? 'active' : ''}" id="tab-mine-btn">Mine</button>
        <button class="nav-btn ${state.activeTab === 'convert' ? 'active' : ''}" id="tab-convert-btn">Convert</button>
      </nav>
      <button class="pwa-btn" id="pwa-install-btn" style="${state.deferredInstallPrompt ? 'display:flex' : 'display:none'}">
        📲 Install App
      </button>
    </header>

    <main class="main-content">
      ${state.activeTab === 'mine' ? renderMineTab(encryptedIdentity) : renderConvertTab(encryptedIdentity)}
      
      <section class="terminal-card full-width">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="terminal-title">BITMINER FEED TERMINAL // LIVE_PROCESSOR</div>
        </div>
        <div class="terminal-body" id="terminal-body">
          <div class="terminal-line info">[SYS_INIT] BitMiner core processor online.</div>
          <div class="terminal-line info">[IDENTITY] Encrypted Miner Email: ${encryptedIdentity}</div>
        </div>
      </section>
    </main>

    <footer class="footer">
      BitMiner Platform &copy; ${new Date().getFullYear()} — High Performance Crypto Miner &amp; Blab Base64 Converter
    </footer>
  `;

  bindEvents();
}

function renderMineTab(encryptedIdentity) {
  return `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">⚡ Mining Operations</h2>
        <span class="stat-label">Status: ${state.isMining ? 'ONLINE (MINING)' : 'IDLE'}</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-label">Hash Rate</span>
          <span class="stat-value">${state.isMining ? '64.8 MH/s' : '0.0 MH/s'}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Mined Blabs</span>
          <span class="stat-value" id="mined-blabs-val">${state.blabsGeneratedCount}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Blocks Found</span>
          <span class="stat-value" id="blocks-found-val">${state.minedBlocksCount}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Miner Identity Email</label>
        <input type="email" class="form-input" id="miner-email-input" value="${state.miner_identity_email}" placeholder="enter email..." />
      </div>

      <div class="form-group">
        <label class="form-label">Base64 Encrypted Identity</label>
        <input type="text" class="form-input" readonly value="${encryptedIdentity}" style="color: var(--accent-purple); font-family: monospace;" />
      </div>

      <button class="action-btn ${state.isMining ? 'stop' : ''}" id="toggle-mining-btn">
        ${state.isMining ? '⏹️ Stop Mining' : '▶️ Start Mining'}
      </button>
    </section>

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">📊 Mining Metrics &amp; Auto-Convert</h2>
      </div>
      
      <div class="toggle-container">
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">Auto-Convert Mined Data</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Automatically process base64 blab combinations into coin values</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="auto-convert-toggle" ${state.autoConvert ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>

      <div class="form-group">
        <label class="form-label">Conversion Value per Blab [app_user_selected_amount]</label>
        <select class="form-select" id="mine-amount-select">
          <option value="0.0010" ${state.app_user_selected_amount === 0.0010 ? 'selected' : ''}>0.0010 BTC / blab</option>
          <option value="0.0025" ${state.app_user_selected_amount === 0.0025 ? 'selected' : ''}>0.0025 BTC / blab</option>
          <option value="0.0050" ${state.app_user_selected_amount === 0.0050 ? 'selected' : ''}>0.0050 BTC / blab</option>
          <option value="0.0100" ${state.app_user_selected_amount === 0.0100 ? 'selected' : ''}>0.0100 BTC / blab</option>
        </select>
      </div>

      <div class="stat-box" style="margin-top: 0.5rem;">
        <span class="stat-label">Total Converted Earnings</span>
        <span class="stat-value" id="total-earnings-val" style="color: var(--accent-green);">${state.totalConvertedAmount.toFixed(4)} BTC</span>
      </div>
    </section>
  `;
}

function renderConvertTab(encryptedIdentity) {
  const pendingBlabs = state.blabs.filter(b => !b.converted).length;
  return `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">🔄 Data Conversion Engine</h2>
      </div>

      <div class="form-group">
        <label class="form-label">Miner Identity Email [miner_identity_email]</label>
        <input type="email" class="form-input" id="convert-email-input" value="${state.miner_identity_email}" />
      </div>

      <div class="form-group">
        <label class="form-label">Base64 Encrypted Identity String</label>
        <input type="text" class="form-input" readonly value="${encryptedIdentity}" style="color: var(--accent-purple); font-family: monospace;" />
      </div>

      <div class="form-group">
        <label class="form-label">Conversion Rate [app_user_selected_amount]</label>
        <input type="number" step="0.0001" class="form-input" id="convert-amount-input" value="${state.app_user_selected_amount}" />
      </div>

      <button class="action-btn" id="manual-convert-btn">
        ⚡ Process &amp; Convert (${pendingBlabs} Pending Blabs)
      </button>
    </section>

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">📈 Conversion Summary</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-label">Total Blabs</span>
          <span class="stat-value">${state.blabs.length}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Converted</span>
          <span class="stat-value" style="color: var(--accent-green);">${state.blabs.filter(b => b.converted).length}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Pending</span>
          <span class="stat-value" style="color: var(--accent-purple);">${pendingBlabs}</span>
        </div>
      </div>

      <div class="stat-box" style="margin-top: 1rem;">
        <span class="stat-label">Converted Crypto Balance</span>
        <span class="stat-value" style="color: var(--accent-green); font-size: 1.6rem;">
          ${state.totalConvertedAmount.toFixed(4)} BTC
        </span>
      </div>
    </section>
  `;
}

function logToTerminal(message, type = 'info') {
  const termBody = document.getElementById('terminal-body');
  if (!termBody) return;
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  termBody.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
}

function processSingleBlabConversion(blabRecord) {
  if (blabRecord.converted) return;
  blabRecord.converted = true;
  state.totalConvertedAmount += parseFloat(state.app_user_selected_amount);
  logToTerminal(
    `[CONVERTED] Blab: ${blabRecord.blab.substring(0, 24)}... -> +${state.app_user_selected_amount} BTC for ${state.miner_identity_email}`,
    'success'
  );
}

function triggerMiningStep() {
  const record = createBlabRecord(state.miner_identity_email);
  state.blabs.push(record);
  state.blabsGeneratedCount++;
  state.minedBlocksCount++;

  const minedVal = document.getElementById('mined-blabs-val');
  if (minedVal) minedVal.textContent = state.blabsGeneratedCount;
  const blocksVal = document.getElementById('blocks-found-val');
  if (blocksVal) blocksVal.textContent = state.minedBlocksCount;

  logToTerminal(
    `[MINED_BLAB] Identity: ${record.encryptedEmail.substring(0, 16)}... | Key: ${record.keyVal.substring(0, 16)}...`,
    'blab'
  );

  if (state.autoConvert) {
    processSingleBlabConversion(record);
    const totalEarn = document.getElementById('total-earnings-val');
    if (totalEarn) totalEarn.textContent = `${state.totalConvertedAmount.toFixed(4)} BTC`;
  }
}

function toggleMining() {
  if (state.isMining) {
    clearInterval(state.miningInterval);
    state.isMining = false;
    logToTerminal('[MINER_HALT] Mining operations stopped.', 'warn');
  } else {
    state.isMining = true;
    logToTerminal(`[MINER_START] Mining initialized for ${state.miner_identity_email}...`, 'info');
    triggerMiningStep();
    state.miningInterval = setInterval(triggerMiningStep, 2500);
  }
  renderApp();
}

function bindEvents() {
  // Tabs
  const tabMine = document.getElementById('tab-mine-btn');
  const tabConvert = document.getElementById('tab-convert-btn');
  if (tabMine) {
    tabMine.addEventListener('click', () => {
      state.activeTab = 'mine';
      renderApp();
    });
  }
  if (tabConvert) {
    tabConvert.addEventListener('click', () => {
      state.activeTab = 'convert';
      renderApp();
    });
  }

  // PWA Install
  const pwaBtn = document.getElementById('pwa-install-btn');
  if (pwaBtn) {
    pwaBtn.addEventListener('click', () => {
      if (state.deferredInstallPrompt) {
        state.deferredInstallPrompt.prompt();
        state.deferredInstallPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            logToTerminal('[PWA] Application installed successfully.', 'success');
          }
          state.deferredInstallPrompt = null;
          pwaBtn.style.display = 'none';
        });
      }
    });
  }

  // Mining Controls
  const toggleBtn = document.getElementById('toggle-mining-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMining);
  }

  const emailInput = document.getElementById('miner-email-input');
  if (emailInput) {
    emailInput.addEventListener('change', (e) => {
      if (e.target.value.trim()) {
        state.miner_identity_email = e.target.value.trim();
        logToTerminal(`[IDENTITY_UPDATED] ${state.miner_identity_email}`, 'info');
        renderApp();
      }
    });
  }

  const autoToggle = document.getElementById('auto-convert-toggle');
  if (autoToggle) {
    autoToggle.addEventListener('change', (e) => {
      state.autoConvert = e.target.checked;
      logToTerminal(`[AUTO_CONVERT] Set to ${state.autoConvert}`, 'info');
    });
  }

  const amountSelect = document.getElementById('mine-amount-select');
  if (amountSelect) {
    amountSelect.addEventListener('change', (e) => {
      state.app_user_selected_amount = parseFloat(e.target.value);
      logToTerminal(`[AMOUNT_UPDATED] app_user_selected_amount: ${state.app_user_selected_amount}`, 'info');
    });
  }

  // Convert Tab Controls
  const convertEmail = document.getElementById('convert-email-input');
  if (convertEmail) {
    convertEmail.addEventListener('change', (e) => {
      if (e.target.value.trim()) {
        state.miner_identity_email = e.target.value.trim();
        renderApp();
      }
    });
  }

  const convertAmount = document.getElementById('convert-amount-input');
  if (convertAmount) {
    convertAmount.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.app_user_selected_amount = val;
        logToTerminal(`[CONVERT_AMOUNT] Updated conversion rate: ${state.app_user_selected_amount}`, 'info');
      }
    });
  }

  const manualConvert = document.getElementById('manual-convert-btn');
  if (manualConvert) {
    manualConvert.addEventListener('click', () => {
      const pending = state.blabs.filter(b => !b.converted);
      if (pending.length === 0) {
        logToTerminal('[CONVERT] No pending blab records to process.', 'warn');
        return;
      }
      pending.forEach(processSingleBlabConversion);
      renderApp();
    });
  }
}

// Initial Render
document.addEventListener('DOMContentLoaded', renderApp);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  renderApp();
}
