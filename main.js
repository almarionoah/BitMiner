/**
 * BitMiner - Core Engine
 * 
 * Integrates Mining & Conversion processing.
 * Strictly implements required core variables:
 *  - [blab]: Combined base64 encrypted email and base64 key value
 *  - [miner_identity_email]: Destination miner identity email
 *  - [app_user_selected_amount]: User specified conversion amount
 */

// Initial state
const state = {
  activeTab: 'mine',
  isMining: false,
  autoConvert: false,
  miner_identity_email: 'miner.node1@bitminer.network',
  app_user_selected_amount: 0.005,
  miningIntervalMs: 2200,
  minedData: [], // Array of { id, timestamp, email, encodedEmail, key, encodedKey, blab, converted, convertedAmount, convertedEmail, txid }
  totalConvertedYield: 0,
  hashrate: 142.6,
  deferredPrompt: null
};

// Load persisted state if exists
const STORAGE_KEY = 'bitminer_data_v2';
function loadPersistedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.minedData)) state.minedData = parsed.minedData;
      if (typeof parsed.miner_identity_email === 'string') state.miner_identity_email = parsed.miner_identity_email;
      if (typeof parsed.app_user_selected_amount === 'number') state.app_user_selected_amount = parsed.app_user_selected_amount;
      if (typeof parsed.totalConvertedYield === 'number') state.totalConvertedYield = parsed.totalConvertedYield;
    }
  } catch (err) {
    console.warn('Could not load stored data', err);
  }
}

function persistData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      minedData: state.minedData,
      miner_identity_email: state.miner_identity_email,
      app_user_selected_amount: state.app_user_selected_amount,
      totalConvertedYield: state.totalConvertedYield
    }));
  } catch (err) {
    console.warn('Could not persist data', err);
  }
}

// Helpers
function randomHex(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateValidEmail() {
  const prefixes = ['alpha', 'cyber', 'node', 'miner', 'hash', 'zero', 'vortex', 'vector', 'blab'];
  const domains = ['cryptomesh.net', 'bitstream.io', 'hashnet.org', 'minerpool.tech', 'nodeid.app'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prefix}.${num}@${domain}`;
}

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    return atob(b64);
  }
}

/**
 * Core Mining Generation Step
 * Auto-generates valid email address in base64 encryption.
 * Generates a base64 key value.
 * Combines the two generated base64 strings to form a [blab].
 */
function generateMinedBlab() {
  const email = generateValidEmail();
  const encodedEmail = encodeBase64(email);
  const rawKey = `BM-${randomHex(8)}-${Date.now().toString(36)}`;
  const encodedKey = encodeBase64(rawKey);
  
  // Combined base64 strings form a blab
  const blab = `${encodedEmail}.${encodedKey}`;
  
  const record = {
    id: 'blab_' + randomHex(4),
    timestamp: new Date().toISOString(),
    email,
    encodedEmail,
    key: rawKey,
    encodedKey,
    blab,
    converted: false,
    convertedAmount: 0,
    convertedEmail: null,
    txid: null
  };

  state.minedData.unshift(record);
  persistData();
  
  logToTerminal('mine', `[MINED] Valid Email: ${email} -> B64: ${encodedEmail}`);
  logToTerminal('mine', `[KEY-GEN] Key: ${rawKey} -> B64: ${encodedKey}`);
  logToTerminal('mine', `[BLAB READY] Core Token: ${blab}`);

  // If auto-convert is enabled, process conversion immediately
  if (state.autoConvert) {
    processBlabConversion(blab, state.miner_identity_email, state.app_user_selected_amount);
  }

  updateUI();
}

/**
 * Core Conversion Processing Algorithm
 * Uses [blab], [miner_identity_email] and [app_user_selected_amount] in the processing algorithm.
 * Gives automatic output responses to the feed terminal for each singular processed final base64 string.
 */
function processBlabConversion(blab, miner_identity_email, app_user_selected_amount) {
  // Find matching blab in repository data
  const record = state.minedData.find(item => item.blab === blab);
  if (!record) {
    logToTerminal('convert', `[ERROR] Blab string not found in pool: ${blab}`, 'error');
    return null;
  }
  if (record.converted) {
    logToTerminal('convert', `[SKIPPED] Blab already converted: ${blab.substring(0, 24)}...`, 'warn');
    return null;
  }

  // Validate miner_identity_email
  const identityEmail = (miner_identity_email || '').trim();
  if (!identityEmail || !identityEmail.includes('@')) {
    logToTerminal('convert', `[FAIL] Invalid miner_identity_email: "${identityEmail}"`, 'error');
    return null;
  }

  // Validate app_user_selected_amount
  const selectedAmount = parseFloat(app_user_selected_amount);
  if (isNaN(selectedAmount) || selectedAmount <= 0) {
    logToTerminal('convert', `[FAIL] Invalid app_user_selected_amount: ${app_user_selected_amount}`, 'error');
    return null;
  }

  // Algorithmic processing using the three core variables:
  // 1. Verify base64 integrity of blab components
  const [encodedEmailPart, encodedKeyPart] = blab.split('.');
  if (!encodedEmailPart || !encodedKeyPart) {
    logToTerminal('convert', `[CORRUPT] Malformed blab structure: ${blab}`, 'error');
    return null;
  }

  const originalEmail = decodeBase64(encodedEmailPart);
  const originalKey = decodeBase64(encodedKeyPart);

  // 2. Synthesize cryptographic receipt using [blab], [miner_identity_email], [app_user_selected_amount]
  const rawReceipt = `${blab}::${identityEmail}::${selectedAmount.toFixed(8)}::${Date.now()}`;
  const txid = '0x' + randomHex(16);

  // Update record status
  record.converted = true;
  record.convertedAmount = selectedAmount;
  record.convertedEmail = identityEmail;
  record.txid = txid;
  record.convertedAt = new Date().toISOString();

  state.totalConvertedYield += selectedAmount;
  persistData();

  // Automatic output response to the feed terminal for this singular processed blab
  logToTerminal('convert', `[CONVERTING] blab: ${blab.substring(0, 18)}...${blab.substring(blab.length - 10)}`);
  logToTerminal('convert', ` ↳ Identity: ${identityEmail} | Amount: ${selectedAmount.toFixed(6)} BTC`);
  logToTerminal('convert', ` ↳ Decoded Origin: ${originalEmail} [Key: ${originalKey}]`);
  logToTerminal('convert', `[SUCCESS] Output TXID: ${txid} -> Yield Credited!`, 'convert');

  updateUI();
  return record;
}

// Feed Terminal Logging with automatic response
const terminalLogs = {
  mine: [],
  convert: []
};

function logToTerminal(type, message, statusClass = 'info') {
  const time = new Date().toTimeString().split(' ')[0];
  const entry = { time, message, statusClass };
  terminalLogs[type].push(entry);
  if (terminalLogs[type].length > 120) terminalLogs[type].shift();

  const termEl = document.getElementById(`${type}-terminal-body`);
  if (termEl) {
    const div = document.createElement('div');
    div.className = `terminal-line ${statusClass}`;
    div.textContent = `[${time}] ${message}`;
    termEl.appendChild(div);
    termEl.scrollTop = termEl.scrollHeight;
  }
}

// Mining Interval Loop
let miningTimer = null;
function startMining() {
  if (state.isMining) return;
  state.isMining = true;
  logToTerminal('mine', '=== MINING ENGINE ONLINE: AUTO-PRODUCING BLABS ===', 'mine');
  generateMinedBlab();
  miningTimer = setInterval(() => {
    state.hashrate = (140 + Math.random() * 15).toFixed(1);
    generateMinedBlab();
  }, state.miningIntervalMs);
  updateUI();
}

function stopMining() {
  if (!state.isMining) return;
  state.isMining = false;
  clearInterval(miningTimer);
  miningTimer = null;
  logToTerminal('mine', '=== MINING ENGINE PAUSED ===', 'warn');
  updateUI();
}

// Batch Conversion for all pending blabs
function convertAllPending() {
  const pending = state.minedData.filter(d => !d.converted);
  if (pending.length === 0) {
    logToTerminal('convert', '[NOTICE] No pending unconverted blabs to process.', 'warn');
    return;
  }
  logToTerminal('convert', `[BATCH START] Processing ${pending.length} pending blabs using core algorithm...`, 'convert');
  
  // Sequentially process each singular blab to deliver distinct feed output
  pending.forEach((item, index) => {
    setTimeout(() => {
      processBlabConversion(item.blab, state.miner_identity_email, state.app_user_selected_amount);
    }, index * 120);
  });
}

// Export mined JSON data
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.minedData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `bitminer_mined_blabs_${Date.now()}.json`);
  dlAnchor.click();
}

// Render App UI
function renderApp() {
  const app = document.getElementById('app');
  const unconvertedCount = state.minedData.filter(d => !d.converted).length;
  const convertedCount = state.minedData.filter(d => d.converted).length;

  app.innerHTML = `
    <header class="header">
      <div class="brand">
        <div class="brand-icon">₿</div>
        <div>
          <div class="brand-title">BitMiner</div>
          <div class="brand-tagline">Decentralized Base64 Crypto Mining & Conversion Hub</div>
        </div>
      </div>

      <nav class="nav-tabs" role="tablist">
        <button id="tab-mine-btn" class="tab-btn ${state.activeTab === 'mine' ? 'active' : ''}">
          ⛏️ Mine
        </button>
        <button id="tab-convert-btn" class="tab-btn ${state.activeTab === 'convert' ? 'active' : ''}">
          🔄 Convert
        </button>
      </nav>

      <div class="header-actions">
        <button id="pwa-install-btn" class="pwa-badge">📲 Install App</button>
      </div>
    </header>

    <!-- Quick Stats Ticker -->
    <section class="stat-ticker">
      <div class="stat-card">
        <span class="stat-label">Mining Hashrate</span>
        <span class="stat-value" id="stat-hashrate">${state.isMining ? state.hashrate + ' MH/s' : '0.0 MH/s'}</span>
      </div>
      <div class="stat-card alt">
        <span class="stat-label">Total Blabs Mined</span>
        <span class="stat-value" id="stat-mined">${state.minedData.length}</span>
      </div>
      <div class="stat-card amber">
        <span class="stat-label">Pending Conversion</span>
        <span class="stat-value" id="stat-pending">${unconvertedCount}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Converted Yield (BTC)</span>
        <span class="stat-value" id="stat-yield">${state.totalConvertedYield.toFixed(5)}</span>
      </div>
    </section>

    <!-- Tab Views -->
    <main id="view-root">
      ${state.activeTab === 'mine' ? renderMineView() : renderConvertView()}
    </main>
  `;

  bindEvents();
  restoreTerminalContents();
}

function renderMineView() {
  const latest = state.minedData[0];
  return `
    <div class="view-container">
      <!-- Mining Deck -->
      <div class="panel">
        <div class="panel-title">
          <span>Mining Operations</span>
          <span class="badge ${state.isMining ? 'badge-converted' : 'badge-unconverted'}">
            ${state.isMining ? 'RUNNING' : 'IDLE'}
          </span>
        </div>

        <div class="visualizer">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
            <span>Base64 Hash Stream</span>
            <span>Difficulty: 0x0FFF</span>
          </div>
          <div class="visualizer-pulse ${state.isMining ? 'active' : ''}"></div>
          <div class="hash-preview">
            ${latest ? `LATEST BLAB: ${latest.blab}` : 'Awaiting initialization. Click Start Mining to begin auto-generation.'}
          </div>
        </div>

        <div class="toggle-container">
          <div>
            <div class="toggle-label">Auto-Convert On Mine</div>
            <div class="toggle-sub">Convert data as it populates the repository pool</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="auto-convert-toggle" ${state.autoConvert ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          ${!state.isMining ? `
            <button id="start-mining-btn" class="btn btn-primary" style="flex:1;">
              ▶ Start Mining
            </button>
          ` : `
            <button id="stop-mining-btn" class="btn btn-danger" style="flex:1;">
              ⏹ Stop Mining
            </button>
          `}
          <button id="single-mine-btn" class="btn btn-outline">
            + Mine 1 Blab
          </button>
        </div>

        <div style="font-size:0.78rem; color:var(--text-dim); line-height: 1.4;">
          ℹ Each mine cycle auto-generates a valid email address encoded in base64, generates a base64 key pair, and concatenates them into a core <code>[blab]</code> unit.
        </div>
      </div>

      <!-- Mining Feed Terminal -->
      <div class="panel">
        <div class="panel-title">
          <span>Mining Terminal Feed</span>
          <button id="clear-mine-term-btn" class="btn btn-outline btn-sm">Clear Feed</button>
        </div>
        <div class="terminal">
          <div class="terminal-header">
            <div class="terminal-title">TERMINAL // RAW_MINED_FEED</div>
            <div class="terminal-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
          </div>
          <div class="terminal-body" id="mine-terminal-body"></div>
        </div>
      </div>
    </div>
  `;
}

function renderConvertView() {
  const unconvertedCount = state.minedData.filter(d => !d.converted).length;
  return `
    <div class="view-container">
      <!-- Conversion Config -->
      <div class="panel">
        <div class="panel-title">
          <span>Conversion Algorithm Configuration</span>
          <span class="badge badge-converted">CORE ALGO ACTIVE</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="miner_identity_email_input">Miner Identity Email [miner_identity_email]</label>
          <input 
            type="email" 
            id="miner_identity_email_input" 
            class="form-input" 
            value="${state.miner_identity_email}"
            placeholder="e.g. your-wallet@miner.network"
          />
          <span style="font-size:0.72rem; color:var(--text-muted);">Identity destination for base64 blab conversion payout</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="app_user_selected_amount_input">Conversion Amount Per Blab [app_user_selected_amount]</label>
          <input 
            type="number" 
            id="app_user_selected_amount_input" 
            class="form-input" 
            step="0.001" 
            min="0.001" 
            value="${state.app_user_selected_amount}"
          />
          <span style="font-size:0.72rem; color:var(--text-muted);">Selected BTC yield conversion rate applied to each processed blab</span>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="convert-all-btn" class="btn btn-success" style="flex:1;" ${unconvertedCount === 0 ? 'disabled' : ''}>
            ⚡ Process Conversion (${unconvertedCount} pending)
          </button>
          <button id="export-json-btn" class="btn btn-outline">
            💾 Download JSON
          </button>
        </div>

        <!-- Pool Inspector Table -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
          <span style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Blab Pool Repository</span>
          <span style="font-size:0.75rem; color:var(--text-dim);">${state.minedData.length} records</span>
        </div>
        <div class="table-wrapper">
          ${state.minedData.length === 0 ? `
            <div class="empty-state">No blab tokens generated yet. Head over to "Mine" to generate.</div>
          ` : `
            <table class="blab-table">
              <thead>
                <tr>
                  <th>Blab Token</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.minedData.map(item => `
                  <tr>
                    <td title="${item.blab}">${item.blab.substring(0, 16)}...</td>
                    <td>
                      <span class="badge ${item.converted ? 'badge-converted' : 'badge-unconverted'}">
                        ${item.converted ? 'CONVERTED' : 'UNCONVERTED'}
                      </span>
                    </td>
                    <td>
                      ${!item.converted ? `
                        <button class="btn btn-primary btn-sm convert-single-btn" data-blab="${item.blab}">
                          Convert
                        </button>
                      ` : `<span style="color:#34d399; font-size:0.75rem;">✓ Paid</span>`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>

      <!-- Conversion Feed Terminal -->
      <div class="panel">
        <div class="panel-title">
          <span>Conversion Terminal Feed</span>
          <button id="clear-convert-term-btn" class="btn btn-outline btn-sm">Clear Feed</button>
        </div>
        <div class="terminal">
          <div class="terminal-header">
            <div class="terminal-title">TERMINAL // AUTOMATIC_CONVERT_OUTPUT</div>
            <div class="terminal-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
          </div>
          <div class="terminal-body" id="convert-terminal-body"></div>
        </div>
      </div>
    </div>
  `;
}

function restoreTerminalContents() {
  const currentType = state.activeTab === 'mine' ? 'mine' : 'convert';
  const termEl = document.getElementById(`${currentType}-terminal-body`);
  if (termEl) {
    termEl.innerHTML = '';
    terminalLogs[currentType].forEach(entry => {
      const div = document.createElement('div');
      div.className = `terminal-line ${entry.statusClass}`;
      div.textContent = `[${entry.time}] ${entry.message}`;
      termEl.appendChild(div);
    });
    termEl.scrollTop = termEl.scrollHeight;
  }
}

function updateUI() {
  // Update stats directly without full redraw if elements exist
  const hashrateEl = document.getElementById('stat-hashrate');
  const minedEl = document.getElementById('stat-mined');
  const pendingEl = document.getElementById('stat-pending');
  const yieldEl = document.getElementById('stat-yield');

  const unconvertedCount = state.minedData.filter(d => !d.converted).length;
  if (hashrateEl) hashrateEl.textContent = state.isMining ? state.hashrate + ' MH/s' : '0.0 MH/s';
  if (minedEl) minedEl.textContent = state.minedData.length;
  if (pendingEl) pendingEl.textContent = unconvertedCount;
  if (yieldEl) yieldEl.textContent = state.totalConvertedYield.toFixed(5);

  // Re-render view container to keep buttons and tables up to date
  const viewRoot = document.getElementById('view-root');
  if (viewRoot) {
    viewRoot.innerHTML = state.activeTab === 'mine' ? renderMineView() : renderConvertView();
    bindEvents();
    restoreTerminalContents();
  }
}

function bindEvents() {
  // Tab Switching
  const tabMineBtn = document.getElementById('tab-mine-btn');
  const tabConvertBtn = document.getElementById('tab-convert-btn');
  if (tabMineBtn) {
    tabMineBtn.onclick = () => {
      state.activeTab = 'mine';
      renderApp();
    };
  }
  if (tabConvertBtn) {
    tabConvertBtn.onclick = () => {
      state.activeTab = 'convert';
      renderApp();
    };
  }

  // Mining Controls
  const startBtn = document.getElementById('start-mining-btn');
  const stopBtn = document.getElementById('stop-mining-btn');
  const singleMineBtn = document.getElementById('single-mine-btn');
  const autoConvertToggle = document.getElementById('auto-convert-toggle');
  const clearMineTermBtn = document.getElementById('clear-mine-term-btn');

  if (startBtn) startBtn.onclick = startMining;
  if (stopBtn) stopBtn.onclick = stopMining;
  if (singleMineBtn) singleMineBtn.onclick = generateMinedBlab;
  if (autoConvertToggle) {
    autoConvertToggle.onchange = (e) => {
      state.autoConvert = e.target.checked;
      logToTerminal('mine', `Auto-convert mode: ${state.autoConvert ? 'ENABLED' : 'DISABLED'}`, 'info');
    };
  }
  if (clearMineTermBtn) {
    clearMineTermBtn.onclick = () => {
      terminalLogs.mine = [];
      restoreTerminalContents();
    };
  }

  // Conversion Controls
  const emailInput = document.getElementById('miner_identity_email_input');
  const amountInput = document.getElementById('app_user_selected_amount_input');
  const convertAllBtn = document.getElementById('convert-all-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const clearConvertTermBtn = document.getElementById('clear-convert-term-btn');

  if (emailInput) {
    emailInput.oninput = (e) => {
      state.miner_identity_email = e.target.value;
      persistData();
    };
  }
  if (amountInput) {
    amountInput.oninput = (e) => {
      state.app_user_selected_amount = parseFloat(e.target.value) || 0.001;
      persistData();
    };
  }
  if (convertAllBtn) convertAllBtn.onclick = convertAllPending;
  if (exportJsonBtn) exportJsonBtn.onclick = exportJSON;
  if (clearConvertTermBtn) {
    clearConvertTermBtn.onclick = () => {
      terminalLogs.convert = [];
      restoreTerminalContents();
    };
  }

  // Convert single item buttons
  document.querySelectorAll('.convert-single-btn').forEach(btn => {
    btn.onclick = () => {
      const blab = btn.getAttribute('data-blab');
      processBlabConversion(blab, state.miner_identity_email, state.app_user_selected_amount);
    };
  });

  // PWA install button handling
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn && state.deferredPrompt) {
    installBtn.classList.add('show');
    installBtn.onclick = async () => {
      if (state.deferredPrompt) {
        state.deferredPrompt.prompt();
        const choice = await state.deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          installBtn.classList.remove('show');
        }
        state.deferredPrompt = null;
      }
    };
  }
}

// PWA Service Worker Registration & beforeinstallprompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('ServiceWorker registration skipped or failed:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.deferredPrompt = e;
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.classList.add('show');
  }
});

// Initialize
loadPersistedData();
renderApp();
logToTerminal('mine', 'System initialized. Ready for Base64 Blab mining.');
logToTerminal('convert', `Conversion Engine Ready. Bound to: ${state.miner_identity_email}`);
console.log('BitMiner application initialized with core variables [blab], [miner_identity_email], [app_user_selected_amount]');
