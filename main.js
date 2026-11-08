import './style.css';

// State Management
const state = {
  activeTab: 'mine',
  autoMining: false,
  mineSpeedMs: 3000,
  minedBlabs: [],
  miningInterval: null,
  totalHashRate: 48.5,
  autoConvert: false,
  userEmailInput: 'operator@bitminer.net',
  installPrompt: null
};

// Utility Helpers for Base64
function toBase64(str) {
  try {
    return btoa(str);
  } catch (e) {
    return btoa(encodeURIComponent(str));
  }
}

function fromBase64(b64) {
  try {
    return atob(b64);
  } catch (e) {
    return decodeURIComponent(atob(b64));
  }
}

function generateRandomHex(len = 32) {
  const chars = '0123456789abcdef';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

function generateEmail() {
  const prefixes = ['miner', 'worker', 'node', 'rig', 'hash_master', 'cyber_node'];
  const domains = ['bitminer.net', 'hashpool.io', 'crypto.org', 'b64miner.com'];
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prefix}_${num}@${domain}`;
}

// Initialize App HTML Shell
function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-container">
      <header class="header">
        <div class="brand">
          <span class="brand-icon">⛏️</span>
          <h1 class="brand-title">BitMiner</h1>
        </div>
        <nav class="nav-tabs">
          <button class="nav-btn ${state.activeTab === 'mine' ? 'active' : ''}" id="tab-mine-btn">Mine</button>
          <button class="nav-btn ${state.activeTab === 'convert' ? 'active' : ''}" id="tab-convert-btn">Convert</button>
        </nav>
        <button class="pwa-btn" id="pwa-install-btn" style="display:none;">📲 Download App</button>
      </header>

      <main class="main-content" id="tab-content-area"></main>

      <section class="terminal-card">
        <div class="terminal-header">
          <div class="terminal-title">
            <span>💻</span>
            <span>FEED TERMINAL</span>
          </div>
          <button class="btn btn-danger" id="clear-terminal-btn" style="padding:0.3rem 0.75rem; font-size:0.75rem;">Clear Terminal</button>
        </div>
        <div class="terminal-feed" id="terminal-feed"></div>
      </section>
    </div>
  `;

  setupEventListeners();
  renderTabContent();
  logToTerminal('SYSTEM', 'BitMiner Core Initialized. Base64 Engine Ready.');
  registerServiceWorker();
}

function logToTerminal(type, message) {
  const feed = document.getElementById('terminal-feed');
  if (!feed) return;

  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const timestamp = new Date().toLocaleTimeString();
  
  entry.innerHTML = `
    <span class="log-time">[${timestamp}]</span>
    <span class="log-type-${type}">[${type}]</span>
    <span>${escapeHtml(message)}</span>
  `;

  feed.appendChild(entry);
  feed.scrollTop = feed.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setupEventListeners() {
  document.getElementById('tab-mine-btn').addEventListener('click', () => switchTab('mine'));
  document.getElementById('tab-convert-btn').addEventListener('click', () => switchTab('convert'));
  document.getElementById('clear-terminal-btn').addEventListener('click', () => {
    const feed = document.getElementById('terminal-feed');
    if (feed) feed.innerHTML = '';
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.installPrompt = e;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.style.display = 'block';
      btn.addEventListener('click', async () => {
        if (state.installPrompt) {
          state.installPrompt.prompt();
          const { outcome } = await state.installPrompt.userChoice;
          logToTerminal('SYSTEM', `PWA Installation choice: ${outcome}`);
          state.installPrompt = null;
          btn.style.display = 'none';
        }
      });
    }
  });
}

function switchTab(tab) {
  state.activeTab = tab;
  document.getElementById('tab-mine-btn').classList.toggle('active', tab === 'mine');
  document.getElementById('tab-convert-btn').classList.toggle('active', tab === 'convert');
  renderTabContent();
}

// Render Active Tab
function renderTabContent() {
  const area = document.getElementById('tab-content-area');
  if (!area) return;

  if (state.activeTab === 'mine') {
    renderMineTab(area);
  } else {
    renderConvertTab(area);
  }
}

function renderMineTab(container) {
  const convertedCount = state.minedBlabs.filter(b => b.status === 'converted').length;
  const pendingCount = state.minedBlabs.length - convertedCount;

  container.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>⛏️ Mining Operations</span>
        <span style="font-size:0.85rem; color:var(--text-muted);">Status: ${state.autoMining ? 'MINING RUNNING' : 'IDLE'}</span>
      </div>

      <div class="stats-bar">
        <div class="stat-box">
          <div class="stat-label">Hashrate</div>
          <div class="stat-value">${(state.totalHashRate + (Math.random() * 2 - 1)).toFixed(1)} MH/s</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total Blabs Mined</div>
          <div class="stat-value">${state.minedBlabs.length}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Pending Conversion</div>
          <div class="stat-value">${pendingCount}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Converted</div>
          <div class="stat-value">${convertedCount}</div>
        </div>
      </div>

      <div class="controls">
        <button class="btn ${state.autoMining ? 'btn-danger' : 'btn-success'}" id="toggle-mining-btn">
          ${state.autoMining ? '⏹ Stop Auto-Mine' : '▶ Start Auto-Mine'}
        </button>
        <button class="btn" id="mine-single-btn">⚡ Mine Single Blab</button>
        <div class="input-group">
          <label class="input-label">Miner Email Identity</label>
          <input type="email" class="input-field" id="miner-email-input" value="${escapeHtml(state.userEmailInput)}" />
        </div>
      </div>

      <div class="card-title" style="margin-top:1rem;">Generated Base64 Blabs Queue</div>
      <div class="blabs-grid" id="mine-blabs-grid">
        ${renderBlabsList(state.minedBlabs.slice(-6).reverse())}
      </div>
    </div>
  `;

  document.getElementById('toggle-mining-btn').addEventListener('click', toggleAutoMining);
  document.getElementById('mine-single-btn').addEventListener('click', () => performMineOperation());
  document.getElementById('miner-email-input').addEventListener('input', (e) => {
    state.userEmailInput = e.target.value || generateEmail();
  });
}

function renderConvertTab(container) {
  const unconvertedBlabs = state.minedBlabs.filter(b => b.status === 'unconverted');

  container.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>🔄 Blab Conversion Center</span>
        <span style="font-size:0.85rem; color:var(--text-muted);">${unconvertedBlabs.length} Ready for Conversion</span>
      </div>

      <div class="controls">
        <button class="btn btn-success" id="convert-all-btn" ${unconvertedBlabs.length === 0 ? 'disabled' : ''}>
          ⚡ Process Batch Conversion (${unconvertedBlabs.length})
        </button>
        <div class="input-group">
          <label class="input-label">Default Conversion Amount (BTC/Blab)</label>
          <input type="number" step="0.001" min="0.001" class="input-field" id="default-amount-input" value="0.0050" />
        </div>
      </div>

      <div class="card-title" style="margin-top:1rem;">Blabs Pending & Processed</div>
      <div class="blabs-grid" id="convert-blabs-grid">
        ${renderConvertBlabsList(state.minedBlabs.slice().reverse())}
      </div>
    </div>
  `;

  document.getElementById('convert-all-btn')?.addEventListener('click', convertAllUnconverted);
  
  // Wire up per-blab amount inputs & convert buttons
  container.querySelectorAll('.blab-convert-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const amountInput = document.getElementById(`amount-input-${id}`);
      const amount = amountInput ? parseFloat(amountInput.value) || 0.005 : 0.005;
      processSingleBlabConversion(id, amount);
    });
  });

  container.querySelectorAll('.blab-amount-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const blab = state.minedBlabs.find(b => b.id === id);
      if (blab) {
        blab.amount = parseFloat(e.target.value) || 0.005;
      }
    });
  });
}

function renderBlabsList(blabs) {
  if (blabs.length === 0) {
    return `<div class="empty-state">No blabs mined yet. Click "Start Auto-Mine" or "Mine Single Blab" above.</div>`;
  }
  return blabs.map(blab => `
    <div class="blab-card ${blab.status}">
      <div class="blab-header">
        <strong style="font-size:0.9rem;">Blab #${blab.id.slice(0, 8)}</strong>
        <span class="blab-badge badge-${blab.status}">${blab.status}</span>
      </div>
      <div style="font-size:0.8rem; color:var(--text-muted);">Plain Email: ${escapeHtml(blab.email)}</div>
      <div class="input-label">Encrypted B64 Email:</div>
      <div class="code-block">${blab.emailB64}</div>
      <div class="input-label">Base64 Key Value:</div>
      <div class="code-block">${blab.keyB64}</div>
    </div>
  `).join('');
}

function renderConvertBlabsList(blabs) {
  if (blabs.length === 0) {
    return `<div class="empty-state">No blabs available for conversion. Go to "Mine" tab to generate base64 blabs.</div>`;
  }
  return blabs.map(blab => `
    <div class="blab-card ${blab.status}">
      <div class="blab-header">
        <strong style="font-size:0.9rem;">Blab #${blab.id.slice(0, 8)}</strong>
        <span class="blab-badge badge-${blab.status}">${blab.status}</span>
      </div>
      <div class="code-block">${blab.blabToken.slice(0, 36)}...</div>
      <div class="input-group" style="margin-top:0.3rem;">
        <label class="input-label">Conversion Amount (BTC)</label>
        <input type="number" step="0.001" min="0.0001" 
               class="input-field blab-amount-input" 
               id="amount-input-${blab.id}" 
               data-id="${blab.id}" 
               value="${blab.amount || 0.0050}" 
               ${blab.status === 'converted' ? 'disabled' : ''} />
      </div>
      ${blab.status === 'unconverted' ? `
        <button class="btn btn-success blab-convert-btn" data-id="${blab.id}" style="margin-top:0.4rem; padding:0.4rem 0.8rem; font-size:0.85rem;">
          🔄 Convert Blab
        </button>
      ` : `
        <div style="font-size:0.8rem; color:#6ee7b7; margin-top:0.3rem;">
          ✓ Converted: ${blab.amount} BTC | Hash: 0x${blab.hashResult ? blab.hashResult.slice(0, 10) : 'OK'}...
        </div>
      `}
    </div>
  `).join('');
}

// Mining Business Logic
function performMineOperation() {
  const rawEmail = state.userEmailInput.trim() || generateEmail();
  const emailB64 = toBase64(rawEmail);
  const rawKey = 'blab_key_' + generateRandomHex(24);
  const keyB64 = toBase64(rawKey);
  const blabToken = `${emailB64}.${keyB64}`;

  const newBlab = {
    id: 'blab_' + generateRandomHex(8),
    email: rawEmail,
    emailB64: emailB64,
    keyB64: keyB64,
    blabToken: blabToken,
    amount: 0.0050,
    status: 'unconverted',
    minedAt: new Date().toISOString()
  };

  state.minedBlabs.push(newBlab);

  logToTerminal('MINE', `Generated B64 Email [${emailB64}] & Key [${keyB64}] -> Combined Blab: ${blabToken.slice(0, 24)}...`);

  if (state.autoConvert) {
    processSingleBlabConversion(newBlab.id, newBlab.amount);
  }

  if (state.activeTab === 'mine') {
    const grid = document.getElementById('mine-blabs-grid');
    if (grid) grid.innerHTML = renderBlabsList(state.minedBlabs.slice(-6).reverse());
  }
}

function toggleAutoMining() {
  state.autoMining = !state.autoMining;
  if (state.autoMining) {
    performMineOperation();
    state.miningInterval = setInterval(() => performMineOperation(), state.mineSpeedMs);
    logToTerminal('SYSTEM', 'Auto-miner service STARTED.');
  } else {
    if (state.miningInterval) clearInterval(state.miningInterval);
    logToTerminal('SYSTEM', 'Auto-miner service STOPPED.');
  }
  renderTabContent();
}

// Conversion Business Logic
function processSingleBlabConversion(blabId, amount) {
  const blab = state.minedBlabs.find(b => b.id === blabId);
  if (!blab) return;
  if (blab.status === 'converted') {
    logToTerminal('SYSTEM', `Blab #${blabId.slice(0,8)} is already converted.`);
    return;
  }

  blab.amount = amount;
  const decodedEmail = fromBase64(blab.emailB64);
  const decodedKey = fromBase64(blab.keyB64);
  const hashResult = generateRandomHex(32);
  
  blab.status = 'converted';
  blab.hashResult = hashResult;
  blab.convertedAt = new Date().toISOString();

  // Feed terminal detailed response output
  logToTerminal('CONVERT', `[SUCCESS] Processed Blab #${blab.id.slice(0, 8)} | Input Amount: ${blab.amount} BTC | Identity: ${decodedEmail} | Key Decoded: ${decodedKey.slice(0, 16)}... | Block Hash: 0x${hashResult}`);

  if (state.activeTab === 'convert') {
    renderTabContent();
  } else if (state.activeTab === 'mine') {
    renderTabContent();
  }
}

function convertAllUnconverted() {
  const defaultInput = document.getElementById('default-amount-input');
  const batchAmount = defaultInput ? parseFloat(defaultInput.value) || 0.005 : 0.005;
  
  const targetBlabs = state.minedBlabs.filter(b => b.status === 'unconverted');
  if (targetBlabs.length === 0) return;

  logToTerminal('SYSTEM', `Batch converting ${targetBlabs.length} pending base64 blabs...`);
  targetBlabs.forEach((blab, index) => {
    setTimeout(() => {
      processSingleBlabConversion(blab.id, blab.amount || batchAmount);
    }, index * 250);
  });
}

// Service Worker Registration for PWA
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => logToTerminal('SYSTEM', 'PWA Service Worker registered successfully.'))
      .catch((err) => logToTerminal('SYSTEM', `Service Worker registration skipped: ${err.message}`));
  }
}

// Kickoff App
document.addEventListener('DOMContentLoaded', initApp);
