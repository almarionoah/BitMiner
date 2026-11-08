/**
 * BitMiner Application Entry Point
 * Lead Release Engineer: Gemini Release Agent
 * Engineers: Kaelen Thorne, Lyra Van Dyk, Turbo Terry
 */

// State Management
const state = {
  activeTab: 'mine', // 'mine' | 'convert'
  isMining: false,
  miningInterval: null,
  hashRate: 148.5,
  minedBlocks: 0,
  totalSats: 0.00481200,
  autoConvert: true,
  emailInput: '',
  jsonItems: [],
  processedCount: 0,
  terminalLogs: [],
  deferredPrompt: null
};

// Sample email domain generators
const DOMAINS = ['gmail.com', 'bitminer.io', 'protonmail.com', 'crypto.net', 'web3node.org'];
const NAMES = ['alex', 'satoshi', 'cyber_user', 'miner99', 'node_alpha', 'crypto_king', 'block_hunter'];

function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateRandomEmail() {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${randomElement(NAMES)}${num}@${randomElement(DOMAINS)}`;
}

function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'KEY_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function toBase64(str) {
  return btoa(str);
}

function fromBase64(b64) {
  try {
    return atob(b64);
  } catch (e) {
    return null;
  }
}

// Add log entry to terminal feed
function addLog(message, type = 'info') {
  const timeStr = new Date().toLocaleTimeString();
  state.terminalLogs.push({ time: timeStr, message, type });
  if (state.terminalLogs.length > 200) state.terminalLogs.shift();
  renderTerminal();
}

// Render layout DOM
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="app-header">
      <div class="logo-section">
        <div class="logo-icon">⚡</div>
        <div>
          <h1 class="logo-title">BitMiner</h1>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Web3 Hash Miner & Base64 Converter</div>
        </div>
      </div>
      <nav class="nav-tabs">
        <button class="tab-btn ${state.activeTab === 'mine' ? 'active' : ''}" id="tab-mine">
          ⛏️ Mine
        </button>
        <button class="tab-btn ${state.activeTab === 'convert' ? 'active' : ''}" id="tab-convert">
          🔄 Convert
        </button>
      </nav>
      <div class="header-actions">
        <button id="install-pwa" class="install-pwa-btn" style="${state.deferredPrompt ? 'display:flex' : 'display:none'}">
          📲 Install App
        </button>
        <div class="badge badge-active">Online</div>
      </div>
    </header>

    <main class="main-container">
      <section class="dashboard-panel">
        ${state.activeTab === 'mine' ? renderMineView() : renderConvertView()}
      </section>

      <aside class="terminal-card">
        <div class="terminal-header">
          <div class="terminal-title">
            <span>>_ FEED TERMINAL STREAM</span>
          </div>
          <div class="terminal-dots">
            <button class="btn btn-secondary" id="clear-terminal" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">Clear</button>
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
        </div>
        <div class="terminal-body" id="terminal-body">
          ${state.terminalLogs.map(log => `
            <div class="log-line">
              <span class="log-time">[${log.time}]</span>
              <span class="log-${log.type}">${escapeHtml(log.message)}</span>
            </div>
          `).join('')}
        </div>
      </aside>
    </main>
  `;

  attachEvents();
  renderTerminalScroll();
}

function renderMineView() {
  return `
    <div class="card">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem;">Cryptocurrency Miner Control</h2>
      <div class="stats-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-label">Hashrate</div>
          <div class="stat-value">${state.isMining ? (state.hashRate + (Math.random() * 5 - 2.5)).toFixed(1) : '0.0'} MH/s</div>
          <div class="stat-sub">⚡ SHA-256 Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Items Mining Populated</div>
          <div class="stat-value">${state.jsonItems.length}</div>
          <div class="stat-sub">Base64 Encrypted Combos</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Mined Balance</div>
          <div class="stat-value">${state.totalSats.toFixed(8)} BTC</div>
          <div class="stat-sub">≈ $${(state.totalSats * 95000).toFixed(2)} USD</div>
        </div>
      </div>

      <div class="controls-row">
        <button class="btn ${state.isMining ? 'btn-secondary' : 'btn-primary'}" id="toggle-miner">
          ${state.isMining ? '⏸ Pause Mining' : '▶ Start Mining Engine'}
        </button>
        <button class="btn btn-secondary" id="generate-single-mine">
          ⚡ Mine Single Block
        </button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 0.8rem; font-size: 1rem; color: var(--text-muted);">LIVE POPULATED JSON STREAM (${state.jsonItems.length} Records)</h3>
      <div class="json-preview">
        <pre>${escapeHtml(JSON.stringify(state.jsonItems.slice(-4), null, 2))}</pre>
      </div>
    </div>
  `;
}

function renderConvertView() {
  return `
    <div class="card">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem;">Base64 Conversion & Email Processor</h2>
      
      <div class="input-group">
        <label class="input-label">Email Input for Targeted Conversion</label>
        <input type="email" class="text-input" id="email-input" placeholder="e.g. user@domain.com" value="${escapeHtml(state.emailInput)}" />
      </div>

      <div class="toggle-container" style="margin-bottom: 1.5rem;">
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">Auto-Convert Functionality</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Automatically decode & process populated JSON string combinations</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="auto-convert-toggle" ${state.autoConvert ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div class="input-group">
        <label class="input-label">Target JSON / Base64 Payload Stream</label>
        <textarea class="text-input textarea-input" id="json-payload-input" placeholder="Paste JSON array or custom Base64 string combinations here...">${state.jsonItems.length ? escapeHtml(JSON.stringify(state.jsonItems, null, 2)) : ''}</textarea>
      </div>

      <div class="controls-row">
        <button class="btn btn-emerald" id="btn-convert-now">
          🔄 Run Conversion Engine
        </button>
        <button class="btn btn-secondary" id="btn-sample-populate">
          📥 Populate Sample Data
        </button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 0.5rem; font-size: 1rem;">Conversion Summary</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Processed Strings</div>
          <div class="stat-value">${state.processedCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Auto-Convert Status</div>
          <div class="stat-value" style="color: #34d399;">${state.autoConvert ? 'ENABLED' : 'MANUAL'}</div>
        </div>
      </div>
    </div>
  `;
}

function renderTerminal() {
  const termBody = document.getElementById('terminal-body');
  if (!termBody) return;
  termBody.innerHTML = state.terminalLogs.map(log => `
    <div class="log-line">
      <span class="log-time">[${log.time}]</span>
      <span class="log-${log.type}">${escapeHtml(log.message)}</span>
    </div>
  `).join('');
  renderTerminalScroll();
}

function renderTerminalScroll() {
  const termBody = document.getElementById('terminal-body');
  if (termBody) {
    termBody.scrollTop = termBody.scrollHeight;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Mining Logic
function mineSingleBlock() {
  const email = state.emailInput.trim() || generateRandomEmail();
  const emailB64 = toBase64(email);
  const keyVal = generateRandomKey();
  const keyB64 = toBase64(keyVal);
  const finalCombination = `${emailB64}:${keyB64}`;
  const comboB64 = toBase64(finalCombination);

  const newItem = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    email: email,
    email_base64: emailB64,
    key_base64: keyB64,
    final_combination_base64: comboB64,
    timestamp: new Date().toISOString()
  };

  state.jsonItems.push(newItem);
  state.minedBlocks++;
  state.totalSats += 0.00004500;

  addLog(`[MINE] Mined email base64: ${emailB64}`, 'mine');
  addLog(`[MINE] Created key base64: ${keyB64}`, 'mine');
  addLog(`[MINE] Combined Hash String: ${comboB64}`, 'mine');

  // Auto-convert trigger if enabled
  if (state.autoConvert) {
    processItemConversion(newItem);
  }

  renderApp();
}

function processItemConversion(item) {
  const decodedCombo = fromBase64(item.final_combination_base64);
  if (!decodedCombo) {
    addLog(`[CONVERT-ERR] Failed to decode base64 combination ${item.final_combination_base64}`, 'warn');
    return;
  }

  const parts = decodedCombo.split(':');
  const decodedEmail = fromBase64(parts[0] || item.email_base64);
  const decodedKey = fromBase64(parts[1] || item.key_base64);

  state.processedCount++;
  addLog(`[CONVERT] Singular Combo Output: ${item.final_combination_base64}`, 'convert');
  addLog(`[CONVERT] -> Decoded Email: ${decodedEmail} | Key: ${decodedKey}`, 'success');
  addLog(`[CONVERT] -> Verification Status: VERIFIED & PROCESSED`, 'success');
}

function processAllConversions() {
  if (state.jsonItems.length === 0) {
    addLog(`[CONVERT] No JSON items to convert. Populating initial block...`, 'warn');
    mineSingleBlock();
    return;
  }

  addLog(`[CONVERT] Processing ${state.jsonItems.length} base64 string combinations...`, 'convert');
  state.jsonItems.forEach(item => processItemConversion(item));
  renderApp();
}

function attachEvents() {
  // Tabs
  document.getElementById('tab-mine')?.addEventListener('click', () => {
    state.activeTab = 'mine';
    renderApp();
  });
  document.getElementById('tab-convert')?.addEventListener('click', () => {
    state.activeTab = 'convert';
    renderApp();
  });

  // Miner events
  document.getElementById('toggle-miner')?.addEventListener('click', () => {
    state.isMining = !state.isMining;
    if (state.isMining) {
      addLog('[SYSTEM] Starting automated mining generator loop...', 'success');
      state.miningInterval = setInterval(() => {
        mineSingleBlock();
      }, 2500);
    } else {
      addLog('[SYSTEM] Miner paused.', 'warn');
      clearInterval(state.miningInterval);
      state.miningInterval = null;
    }
    renderApp();
  });

  document.getElementById('generate-single-mine')?.addEventListener('click', () => {
    mineSingleBlock();
  });

  // Conversion events
  document.getElementById('email-input')?.addEventListener('input', (e) => {
    state.emailInput = e.target.value;
  });

  document.getElementById('auto-convert-toggle')?.addEventListener('change', (e) => {
    state.autoConvert = e.target.checked;
    addLog(`[SYSTEM] Auto-convert functionality toggled to: ${state.autoConvert ? 'ON' : 'OFF'}`, 'info');
  });

  document.getElementById('btn-convert-now')?.addEventListener('click', () => {
    processAllConversions();
  });

  document.getElementById('btn-sample-populate')?.addEventListener('click', () => {
    mineSingleBlock();
    mineSingleBlock();
    addLog(`[SYSTEM] Populated sample base64 JSON payload.`, 'info');
  });

  document.getElementById('clear-terminal')?.addEventListener('click', () => {
    state.terminalLogs = [];
    renderTerminal();
  });

  // PWA Install
  document.getElementById('install-pwa')?.addEventListener('click', async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      addLog(`[PWA] Install prompt outcome: ${outcome}`, 'info');
      state.deferredPrompt = null;
      renderApp();
    }
  });
}

// PWA Event Handler
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.deferredPrompt = e;
  renderApp();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => console.log('PWA ServiceWorker registered:', reg.scope),
      (err) => console.log('ServiceWorker registration failed:', err)
    );
  });
}

// Initial setup
addLog('[SYSTEM] BitMiner Engine v1.0 Initialized.', 'success');
addLog('[SYSTEM] Ready for Base64 Email Encryption & Conversion.', 'info');
renderApp();
