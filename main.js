/**
 * BitMiner - Cryptocurrency Miner & Auto-Conversion Engine
 * Authors: Kaelen Thorne, Lyra Van Dyk, Turbo Terry
 */

// State Store
const state = {
  activeTab: 'mine',
  isMining: false,
  autoConvert: true,
  hashRate: 0,
  blocksMined: 0,
  encryptedEmailsCount: 0,
  keysGeneratedCount: 0,
  minedBlocks: [],
  convertedData: [],
  logs: [],
  miningInterval: null,
  hashInterval: null,
  manualInputEmail: ''
};

// Initial Pool Data for Auto-Mining Generator
const sampleUsernames = ['satoshi', 'block_hunter', 'crypto_miner', 'cyber_node', 'alpha_miner', 'hash_master', 'bit_runner', 'neon_protocol', 'quantum_miner', 'zero_knowledge'];
const sampleDomains = ['minerpool.net', 'bitminer.org', 'crypto-node.io', 'blockchain.dev', 'hashnet.com', 'satoshimining.cloud'];

// Base64 Helpers
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return null;
  }
}

function generateRandomHash(length = 16) {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < length; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  state.logs.unshift({ timestamp, message, type });
  if (state.logs.length > 50) state.logs.pop();
  renderLogs();
}

// Mining logic
function createMinedBlock() {
  const randomUser = sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)] + Math.floor(Math.random() * 999);
  const randomDomain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];
  const plainEmail = `${randomUser}@${randomDomain}`;
  
  // Base64 Encrypted Email
  const encryptedEmail = toBase64(plainEmail);
  
  // Base64 Key Value derived from block hash & payload
  const rawKeyPayload = `KEY-${generateRandomHash(12)}-${Date.now()}`;
  const base64Key = toBase64(rawKeyPayload);
  
  const block = {
    id: state.blocksMined + 1,
    timestamp: new Date().toISOString(),
    hash: '0000' + generateRandomHash(28),
    encryptedEmail: encryptedEmail,
    base64Key: base64Key,
    difficulty: (Math.random() * 4 + 1).toFixed(2),
    rewardBTC: (Math.random() * 0.005 + 0.001).toFixed(6)
  };

  state.blocksMined++;
  state.encryptedEmailsCount++;
  state.keysGeneratedCount++;
  state.minedBlocks.unshift(block);

  addLog(`Block #${block.id} Mined! Hash: ${block.hash.substring(0, 14)}...`, 'success');
  addLog(`Encrypted Email: ${encryptedEmail}`, 'highlight');
  addLog(`Generated Base64 Key: ${base64Key}`);

  // Auto-convert functionality trigger
  if (state.autoConvert) {
    processAutoConversion(block);
  }

  renderStats();
  renderMinedBlocks();
  renderJsonViewer();
}

// Conversion Logic
function processAutoConversion(block) {
  const decryptedEmail = fromBase64(block.encryptedEmail);
  const decryptedKey = fromBase64(block.base64Key);
  
  const convertedItem = {
    blockId: block.id,
    convertedAt: new Date().toISOString(),
    encryptedEmail: block.encryptedEmail,
    decryptedEmail: decryptedEmail || 'Invalid Base64',
    base64Key: block.base64Key,
    decryptedKey: decryptedKey || 'Invalid Key',
    status: decryptedEmail ? 'VERIFIED_CONVERTED' : 'FAILED',
    convertedValueUSD: (parseFloat(block.rewardBTC) * 65000).toFixed(2)
  };

  // Check if item already converted
  const existingIdx = state.convertedData.findIndex(item => item.blockId === block.id);
  if (existingIdx >= 0) {
    state.convertedData[existingIdx] = convertedItem;
  } else {
    state.convertedData.unshift(convertedItem);
  }
}

function handleManualConversion(inputVal) {
  const rawInput = inputVal.trim();
  if (!rawInput) return;

  let encEmail = rawInput;
  let decEmail = fromBase64(rawInput);

  // If user entered a plain email directly, we auto-encode it first then convert
  if (!decEmail && rawInput.includes('@')) {
    encEmail = toBase64(rawInput);
    decEmail = rawInput;
  }

  const generatedKey = toBase64(`MANUAL-KEY-${generateRandomHash(8)}`);
  const decKey = fromBase64(generatedKey);

  const manualResult = {
    blockId: `MANUAL-${Date.now()}`,
    convertedAt: new Date().toISOString(),
    encryptedEmail: encEmail,
    decryptedEmail: decEmail || 'Decryption Error (Invalid Base64)',
    base64Key: generatedKey,
    decryptedKey: decKey,
    status: decEmail ? 'MANUAL_CONVERTED' : 'INVALID_INPUT',
    convertedValueUSD: (Math.random() * 50 + 10).toFixed(2)
  };

  state.convertedData.unshift(manualResult);
  addLog(`Manual Email Converted: ${decEmail || encEmail}`, 'success');
  renderJsonViewer();
  renderStats();
}

// Toggle Mining state
function toggleMining() {
  state.isMining = !state.isMining;
  const mineBtn = document.getElementById('mine-toggle-btn');
  
  if (state.isMining) {
    mineBtn.innerText = 'Stop Mining Engine';
    mineBtn.className = 'btn btn-danger';
    addLog('Miner engine initialized. Mining blocks...', 'info');
    
    state.hashInterval = setInterval(() => {
      state.hashRate = Math.floor(Math.random() * 120) + 420;
      renderStats();
    }, 1000);

    state.miningInterval = setInterval(() => {
      createMinedBlock();
    }, 3500);
  } else {
    mineBtn.innerText = 'Start Mining Engine';
    mineBtn.className = 'btn btn-primary';
    addLog('Miner engine paused.', 'info');
    clearInterval(state.miningInterval);
    clearInterval(state.hashInterval);
    state.hashRate = 0;
    renderStats();
  }
}

// Render Functions
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="header">
      <div class="logo-container">
        <div class="logo-icon">⚡</div>
        <div class="logo-text">BitMiner</div>
      </div>
      <nav class="nav-menu">
        <button id="nav-mine" class="nav-btn ${state.activeTab === 'mine' ? 'active' : ''}">
          ⛏️ Mine
        </button>
        <button id="nav-convert" class="nav-btn ${state.activeTab === 'convert' ? 'active' : ''}">
          🔄 Convert
        </button>
      </nav>
    </header>

    <main class="grid-container">
      <!-- Sidebar Stats & Controls -->
      <aside>
        <div class="card">
          <div class="card-title">
            Mining Metrics
            <span class="badge" id="status-badge">${state.isMining ? 'ACTIVE' : 'IDLE'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hash Rate</span>
            <span class="stat-value glow" id="stat-hashrate">0 H/s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Blocks Mined</span>
            <span class="stat-value" id="stat-blocks">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Base64 Encrypted Emails</span>
            <span class="stat-value" id="stat-emails">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Generated Base64 Keys</span>
            <span class="stat-value" id="stat-keys">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Converted Data Records</span>
            <span class="stat-value glow" id="stat-converted">0</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title">System Controls</div>
          <button id="mine-toggle-btn" class="btn btn-primary">
            Start Mining Engine
          </button>
        </div>
      </aside>

      <!-- Main Tab Content -->
      <section>
        <!-- MINE VIEW -->
        <div id="view-mine" class="${state.activeTab === 'mine' ? '' : 'hidden'}">
          <div class="card">
            <div class="card-title">Live Mining Console Log</div>
            <div id="terminal-log" class="terminal"></div>
          </div>

          <div class="card">
            <div class="card-title">Mined Encrypted Block Stream</div>
            <div id="blocks-stream"></div>
          </div>
        </div>

        <!-- CONVERT VIEW -->
        <div id="view-convert" class="${state.activeTab === 'convert' ? '' : 'hidden'}">
          <div class="card">
            <div class="card-title">Email & Data Conversion Panel</div>
            
            <div class="toggle-container">
              <div>
                <strong>Auto-Convert Functionality</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">Automatically processes and converts data as it populates the JSON file</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="auto-convert-toggle" ${state.autoConvert ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-label" for="convert-email-input">Base64 Encrypted Email / Plain Email Input</label>
              <input 
                type="text" 
                id="convert-email-input" 
                class="input-field" 
                placeholder="e.g. dXNlckBtaW5lcnBvb2wubmV0 or paste plain email..."
                value="${state.manualInputEmail}"
              />
            </div>

            <div class="action-bar">
              <button id="btn-convert-now" class="btn btn-secondary">Convert Input Now</button>
              <button id="btn-download-json" class="btn btn-outline">Download Converted JSON</button>
            </div>
          </div>

          <div class="card">
            <div class="card-title">
              Live Converted JSON Dataset
              <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">Auto-updated</span>
            </div>
            <div id="json-viewer-container" class="json-viewer"></div>
          </div>
        </div>
      </section>
    </main>
  `;

  attachEventListeners();
  renderStats();
  renderLogs();
  renderMinedBlocks();
  renderJsonViewer();
}

function attachEventListeners() {
  document.getElementById('nav-mine').addEventListener('click', () => switchTab('mine'));
  document.getElementById('nav-convert').addEventListener('click', () => switchTab('convert'));
  document.getElementById('mine-toggle-btn').addEventListener('click', toggleMining);

  const autoToggle = document.getElementById('auto-convert-toggle');
  if (autoToggle) {
    autoToggle.addEventListener('change', (e) => {
      state.autoConvert = e.target.checked;
      addLog(`Auto-Convert set to ${state.autoConvert ? 'ENABLED' : 'DISABLED'}`, 'info');
      if (state.autoConvert) {
        // Convert existing mined blocks that aren't converted yet
        state.minedBlocks.forEach(block => processAutoConversion(block));
        renderJsonViewer();
        renderStats();
      }
    });
  }

  const emailInput = document.getElementById('convert-email-input');
  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      state.manualInputEmail = e.target.value;
      if (state.autoConvert && state.manualInputEmail.trim().length > 3) {
        handleManualConversion(state.manualInputEmail);
      }
    });
  }

  const convertBtn = document.getElementById('btn-convert-now');
  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      const val = document.getElementById('convert-email-input').value;
      handleManualConversion(val);
    });
  }

  const downloadBtn = document.getElementById('btn-download-json');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadJsonData);
  }
}

function switchTab(tab) {
  state.activeTab = tab;
  document.getElementById('nav-mine').classList.toggle('active', tab === 'mine');
  document.getElementById('nav-convert').classList.toggle('active', tab === 'convert');
  document.getElementById('view-mine').classList.toggle('hidden', tab !== 'mine');
  document.getElementById('view-convert').classList.toggle('hidden', tab !== 'convert');
}

function renderStats() {
  const elHash = document.getElementById('stat-hashrate');
  const elBlocks = document.getElementById('stat-blocks');
  const elEmails = document.getElementById('stat-emails');
  const elKeys = document.getElementById('stat-keys');
  const elConverted = document.getElementById('stat-converted');
  const elBadge = document.getElementById('status-badge');

  if (elHash) elHash.innerText = `${state.hashRate} H/s`;
  if (elBlocks) elBlocks.innerText = state.blocksMined;
  if (elEmails) elEmails.innerText = state.encryptedEmailsCount;
  if (elKeys) elKeys.innerText = state.keysGeneratedCount;
  if (elConverted) elConverted.innerText = state.convertedData.length;
  if (elBadge) {
    elBadge.innerText = state.isMining ? 'ACTIVE' : 'IDLE';
    elBadge.style.background = state.isMining ? 'rgba(74, 222, 128, 0.2)' : 'rgba(56, 189, 248, 0.15)';
    elBadge.style.color = state.isMining ? '#4ade80' : '#38bdf8';
  }
}

function renderLogs() {
  const container = document.getElementById('terminal-log');
  if (!container) return;
  container.innerHTML = state.logs.map(log => `
    <div class="terminal-line">
      <span class="timestamp">[${log.timestamp}]</span>
      <span class="${log.type}">${log.message}</span>
    </div>
  `).join('');
}

function renderMinedBlocks() {
  const container = document.getElementById('blocks-stream');
  if (!container) return;
  if (state.minedBlocks.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:1.5rem;">No blocks mined yet. Click "Start Mining Engine" to generate encrypted emails &amp; keys.</div>';
    return;
  }

  container.innerHTML = state.minedBlocks.slice(0, 5).map(block => `
    <div class="block-card">
      <div class="block-header">
        <strong>Block #${block.id}</strong>
        <span>${new Date(block.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="block-field"><span>Encrypted Email (Base64):</span> <code>${block.encryptedEmail}</code></div>
      <div class="block-field"><span>Key Value (Base64):</span> <code>${block.base64Key}</code></div>
    </div>
  `).join('');
}

function renderJsonViewer() {
  const container = document.getElementById('json-viewer-container');
  if (!container) return;
  const payload = {
    minerVersion: "1.0.0",
    autoConvertEnabled: state.autoConvert,
    totalRecords: state.convertedData.length,
    convertedPayload: state.convertedData
  };
  container.textContent = JSON.stringify(payload, null, 2);
}

function downloadJsonData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.convertedData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `bitminer_converted_data_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Initialize App
renderApp();
addLog('BitMiner initialization complete. Ready for mining and conversion tasks.', 'info');
