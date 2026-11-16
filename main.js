import './style.css';

// Core State Management
const state = {
  activeTab: 'mine', // 'mine' | 'convert'
  isMining: false,
  miner_identity_email: '', // Base64 encrypted email
  raw_email: '',
  blab: '', // Base64 block key
  app_user_selected_amount: 1.00,
  autoConvert: true,
  minedBlocks: 0,
  hashRate: 0,
  blabQueue: [],
  convertedTotal: 0.00,
  terminalLogs: [],
  deferredPrompt: null
};

// Helper Utilities
function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function generateRandomEmail() {
  const domains = ['bitminer.net', 'block.io', 'cipher.org', 'node.hash'];
  const rand = Math.random().toString(36).substring(2, 8);
  return `miner_${rand}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function generateBase64Key() {
  const timestamp = Date.now();
  const nonce = Math.floor(Math.random() * 1000000);
  const rawKey = `BLAB-BLOCK-${timestamp}-${nonce}`;
  return encodeBase64(rawKey);
}

function appendLog(message, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const logItem = { id: Date.now() + Math.random(), time, message, type };
  state.terminalLogs.push(logItem);
  if (state.terminalLogs.length > 80) state.terminalLogs.shift();
  
  const terminalEl = document.getElementById('terminal-feed');
  if (terminalEl) {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerText = `[${time}] ${message}`;
    terminalEl.appendChild(line);
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }
}

// Conversion Processing Algorithm utilizing core variables
function processConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || !miner_identity_email) return null;

  // Execute conversion calculation based on blab entropy and user requested amount
  const blabWeight = blab.length % 7 + 1;
  const calculatedYield = parseFloat((app_user_selected_amount * (0.0025 * blabWeight)).toFixed(6));
  const processedHash = encodeBase64(`${blab}:${miner_identity_email}:${app_user_selected_amount}:${Date.now()}`);

  state.convertedTotal += calculatedYield;

  const outputResponse = `[CONVERTED] Combined (${blab.substring(0, 10)}...) with miner identity (${miner_identity_email.substring(0, 12)}...) for requested amount: ${app_user_selected_amount} -> Output Yield: +${calculatedYield} BTC (Ref: ${processedHash.substring(0, 16)}...)`;
  
  appendLog(outputResponse, 'success');
  updateStatsUI();
  return {
    blab,
    miner_identity_email,
    app_user_selected_amount,
    calculatedYield,
    processedHash
  };
}

// Mining Interval Loop
let minerInterval = null;

function startMining() {
  if (state.isMining) return;
  state.isMining = true;
  appendLog('Initializing BitMiner engine threads...', 'meta');
  renderApp();

  minerInterval = setInterval(() => {
    if (!state.isMining) return;

    // 1. Generate miner identity email in Base64 encryption
    state.raw_email = generateRandomEmail();
    state.miner_identity_email = encodeBase64(state.raw_email);

    // 2. Generate Base64 key value (blab)
    state.blab = generateBase64Key();

    // Update metrics
    state.minedBlocks += 1;
    state.hashRate = (Math.random() * 45 + 110).toFixed(2);

    const minedItem = {
      id: state.minedBlocks,
      blab: state.blab,
      miner_identity_email: state.miner_identity_email,
      timestamp: new Date().toLocaleTimeString()
    };
    state.blabQueue.unshift(minedItem);

    appendLog(`Mined Block #${state.minedBlocks} | Identity Email (B64): ${state.miner_identity_email.substring(0, 16)}... | BLAB: ${state.blab.substring(0, 16)}...`, 'info');

    // Auto-conversion trigger if enabled
    if (state.autoConvert) {
      processConversion(state.blab, state.miner_identity_email, state.app_user_selected_amount);
    }

    updateStatsUI();
  }, 2500);
}

function stopMining() {
  state.isMining = false;
  if (minerInterval) clearInterval(minerInterval);
  appendLog('Mining operation paused by user.', 'warning');
  renderApp();
}

function updateStatsUI() {
  const elBlocks = document.getElementById('stat-blocks');
  const elHashRate = document.getElementById('stat-hashrate');
  const elConverted = document.getElementById('stat-converted');
  const elBlab = document.getElementById('current-blab');
  const elEmail = document.getElementById('current-email');

  if (elBlocks) elBlocks.innerText = state.minedBlocks;
  if (elHashRate) elHashRate.innerText = state.isMining ? `${state.hashRate} MH/s` : '0.00 MH/s';
  if (elConverted) elConverted.innerText = `${state.convertedTotal.toFixed(6)} BTC`;
  if (elBlab) elBlab.innerText = state.blab || 'Waiting for block...';
  if (elEmail) elEmail.innerText = state.miner_identity_email || 'Not generated';
}

// UI Rendering Engine
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header>
      <div class="brand">
        <div class="brand-logo">⚡ BitMiner</div>
        <span style="font-size:0.75rem; background:rgba(99,102,241,0.2); padding:0.2rem 0.5rem; border-radius:4px; border:1px solid rgba(99,102,241,0.4);">v1.0 PWA</span>
      </div>
      <nav class="nav-menu">
        <button class="nav-btn ${state.activeTab === 'mine' ? 'active' : ''}" id="tab-mine">Mine</button>
        <button class="nav-btn ${state.activeTab === 'convert' ? 'active' : ''}" id="tab-convert">Convert</button>
      </nav>
      <button class="pwa-btn" id="pwa-install-btn" style="${state.deferredPrompt ? 'display:flex' : 'display:none'}">
        📲 Download App
      </button>
    </header>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">Blocks Mined</div>
        <div class="stat-value" id="stat-blocks">${state.minedBlocks}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Hash Rate</div>
        <div class="stat-value" id="stat-hashrate">${state.isMining ? state.hashRate + ' MH/s' : '0.00 MH/s'}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Converted Yield</div>
        <div class="stat-value" id="stat-converted">${state.convertedTotal.toFixed(6)} BTC</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Conversion Rate</div>
        <div class="stat-value">$${state.app_user_selected_amount.toFixed(2)} / Unit</div>
      </div>
    </div>

    <div class="grid-layout">
      <div class="card">
        ${state.activeTab === 'mine' ? renderMineTab() : renderConvertTab()}
      </div>

      <div class="card">
        <div class="card-title">
          <span>📡 Live Feed Terminal Output</span>
          <button id="clear-terminal" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.8rem;">Clear</button>
        </div>
        <div class="terminal-container" id="terminal-feed">
          ${state.terminalLogs.map(log => `<div class="terminal-line ${log.type}">[${log.time}] ${log.message}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function renderMineTab() {
  return `
    <div class="card-title">
      <span>⛏️ Base64 Mining Controller</span>
      <span style="font-size:0.8rem; color:${state.isMining ? 'var(--neon-green)' : 'var(--text-muted)'};">
        ${state.isMining ? '● Active' : '○ Standby'}
      </span>
    </div>

    <div class="form-group">
      <label>Current Encrypted Identity Email [miner_identity_email]</label>
      <div class="blab-badge" id="current-email">${state.miner_identity_email || 'Click Start Mining to auto-generate encrypted email...'}</div>
    </div>

    <div class="form-group">
      <label>Current Generated Key Value [blab]</label>
      <div class="blab-badge" id="current-blab">${state.blab || 'Waiting for block mining loop...'}</div>
    </div>

    <label class="toggle-label">
      <input type="checkbox" class="toggle-input" id="auto-convert-toggle" ${state.autoConvert ? 'checked' : ''}>
      Auto-convert mined data as it populates
    </label>

    ${state.isMining ? 
      `<button class="action-btn danger" id="btn-toggle-mine">⏸ Pause Mining</button>` :
      `<button class="action-btn" id="btn-toggle-mine">▶ Start Auto Mining</button>`
    }
  `;
}

function renderConvertTab() {
  return `
    <div class="card-title">
      <span>🔄 Data Conversion Processor</span>
    </div>

    <div class="form-group">
      <label for="input-miner-email">Target Identity Base64 Email [miner_identity_email]</label>
      <input type="text" id="input-miner-email" value="${state.miner_identity_email}" placeholder="Enter base64 email string..." />
    </div>

    <div class="form-group">
      <label for="input-blab">Block Key Base64 Value [blab]</label>
      <input type="text" id="input-blab" value="${state.blab}" placeholder="Enter base64 blab string..." />
    </div>

    <div class="form-group">
      <label for="input-amount">Conversion Amount [app_user_selected_amount]</label>
      <input type="number" step="0.1" min="0.1" id="input-amount" value="${state.app_user_selected_amount}" />
      <div class="amount-presets">
        <button class="preset-btn ${state.app_user_selected_amount === 0.5 ? 'selected' : ''}" data-amount="0.5">0.5x</button>
        <button class="preset-btn ${state.app_user_selected_amount === 1.0 ? 'selected' : ''}" data-amount="1.0">1.0x</button>
        <button class="preset-btn ${state.app_user_selected_amount === 2.5 ? 'selected' : ''}" data-amount="2.5">2.5x</button>
        <button class="preset-btn ${state.app_user_selected_amount === 5.0 ? 'selected' : ''}" data-amount="5.0">5.0x</button>
      </div>
    </div>

    <button class="action-btn" id="btn-manual-convert">
      ⚡ Execute Conversion Algorithm
    </button>
  `;
}

function bindEvents() {
  // Tab navigation
  document.getElementById('tab-mine')?.addEventListener('click', () => {
    state.activeTab = 'mine';
    renderApp();
  });

  document.getElementById('tab-convert')?.addEventListener('click', () => {
    state.activeTab = 'convert';
    renderApp();
  });

  // Mining button
  document.getElementById('btn-toggle-mine')?.addEventListener('click', () => {
    if (state.isMining) {
      stopMining();
    } else {
      startMining();
    }
  });

  // Auto convert checkbox
  document.getElementById('auto-convert-toggle')?.addEventListener('change', (e) => {
    state.autoConvert = e.target.checked;
    appendLog(`Auto-convert setting changed to: ${state.autoConvert}`, 'meta');
  });

  // Conversion input bindings
  document.getElementById('input-miner-email')?.addEventListener('input', (e) => {
    state.miner_identity_email = e.target.value;
  });

  document.getElementById('input-blab')?.addEventListener('input', (e) => {
    state.blab = e.target.value;
  });

  document.getElementById('input-amount')?.addEventListener('input', (e) => {
    state.app_user_selected_amount = parseFloat(e.target.value) || 1.0;
  });

  // Amount preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = parseFloat(e.target.getAttribute('data-amount'));
      state.app_user_selected_amount = val;
      renderApp();
    });
  });

  // Manual conversion trigger
  document.getElementById('btn-manual-convert')?.addEventListener('click', () => {
    if (!state.blab || !state.miner_identity_email) {
      appendLog('Conversion failed: Both [blab] and [miner_identity_email] must be valid base64 strings.', 'warning');
      return;
    }
    processConversion(state.blab, state.miner_identity_email, state.app_user_selected_amount);
  });

  // Clear terminal feed
  document.getElementById('clear-terminal')?.addEventListener('click', () => {
    state.terminalLogs = [];
    const feed = document.getElementById('terminal-feed');
    if (feed) feed.innerHTML = '';
  });

  // PWA Install trigger
  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      appendLog(`PWA Install outcome: ${outcome}`, 'meta');
      state.deferredPrompt = null;
      renderApp();
    }
  });
}

// PWA Service Worker Registration & Installation Listener
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.deferredPrompt = e;
  renderApp();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration skipped or error:', err);
    });
  });
}

// Initial setup
appendLog('BitMiner web app initialized. Ready for operations.', 'meta');
renderApp();
