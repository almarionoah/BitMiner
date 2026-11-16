// BitMiner Application Core Engine
// Lead release implementation by Kaelen Thorne, Lyra Van Dyk, Mint Reyes

let state = {
  activeTab: 'mine', // 'mine' | 'convert'
  isMining: false,
  autoConvert: true,
  minerIdentityEmail: 'miner_' + Math.random().toString(36).substring(2, 8) + '@bitminer.net',
  selectedAmount: '0.05',
  hashRate: 0,
  blocksMined: 0,
  totalConverted: 0,
  minedBlabs: [],
  feedLogs: [],
  installPrompt: null
};

let miningInterval = null;

// Helpers for Base64 encoding
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return str;
  }
}

// Generate random email in base64
function generateEncryptedEmail() {
  const domains = ['bitminer.net', 'crypto-pool.org', 'node-miner.io', 'hash-vault.com'];
  const randomPrefix = 'miner_' + Math.floor(1000 + Math.random() * 9000);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const rawEmail = `${randomPrefix}@${domain}`;
  return {
    raw: rawEmail,
    encoded: toBase64(rawEmail)
  };
}

// Generate random Key in base64
function generateBase64Key() {
  const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  const byteString = String.fromCharCode.apply(null, randomBytes);
  return toBase64(byteString);
}

// Main processing algorithm using core variables
function processConversionAlgorithm(blab, miner_identity_email, app_user_selected_amount) {
  const timestamp = Date.now();
  const rawCombined = `${blab}:${miner_identity_email}:${app_user_selected_amount}:${timestamp}`;
  const conversionHash = toBase64(rawCombined);
  const parsedAmount = parseFloat(app_user_selected_amount) || 0.05;
  const rewardOutput = (parsedAmount * (0.98 + Math.random() * 0.05)).toFixed(6);

  const outputResponse = `[CONVERTED] Processed BLAB: ${blab.substring(0, 18)}... | Email: ${miner_identity_email} | Amount: ${app_user_selected_amount} -> Yield Hash: ${conversionHash.substring(0, 16)}... | Reward: ${rewardOutput} BTC`;
  
  return {
    blab,
    miner_identity_email,
    app_user_selected_amount,
    conversionHash,
    rewardOutput,
    outputResponse
  };
}

function logTerminal(message, type = 'system') {
  const timestamp = new Date().toLocaleTimeString();
  const formattedLog = `[${timestamp}] ${message}`;
  state.feedLogs.push({ text: formattedLog, type });
  if (state.feedLogs.length > 100) state.feedLogs.shift();
  
  const terminal = document.getElementById('feed-terminal');
  if (terminal) {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = formattedLog;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }
}

function triggerMiningStep() {
  state.blocksMined++;
  state.hashRate = (45.2 + Math.random() * 12.8).toFixed(2);
  
  // Step 1: Auto generate valid email address in base64
  const emailData = generateEncryptedEmail();
  // miner_identity_email variable
  const miner_identity_email = emailData.raw;
  const miner_identity_email_b64 = emailData.encoded;
  
  // Step 2: Generate base64 key value
  const base64Key = generateBase64Key();
  
  // Step 3: Combine generated base64 strings into core variable [blab]
  const blab = toBase64(`${miner_identity_email_b64}:${base64Key}`);
  state.minedBlabs.push(blab);
  
  logTerminal(`[MINE] Block #${state.blocksMined} Mined! Generated Base64 Email: ${miner_identity_email_b64.substring(0, 12)}... | Key: ${base64Key.substring(0, 12)}...`, 'mine');
  logTerminal(`[MINE] Encrypted BLAB created: ${blab}`, 'mine');
  
  // Auto convert option
  if (state.autoConvert) {
    const app_user_selected_amount = state.selectedAmount;
    const result = processConversionAlgorithm(blab, miner_identity_email, app_user_selected_amount);
    state.totalConverted += parseFloat(result.rewardOutput);
    logTerminal(result.outputResponse, 'convert');
  }
  
  updateUI();
}

function startMining() {
  if (state.isMining) return;
  state.isMining = true;
  logTerminal('Mining engine started. Processing cryptographic blocks...', 'system');
  triggerMiningStep();
  miningInterval = setInterval(triggerMiningStep, 4000);
  updateUI();
}

function stopMining() {
  if (!state.isMining) return;
  state.isMining = false;
  clearInterval(miningInterval);
  state.hashRate = 0;
  logTerminal('Mining engine paused.', 'system');
  updateUI();
}

function manualConvertAll() {
  if (state.minedBlabs.length === 0) {
    logTerminal('No unprocessed BLAB data available for conversion. Start mining first!', 'system');
    return;
  }
  
  const emailInput = document.getElementById('email-input');
  const amountInput = document.getElementById('amount-input');
  
  const miner_identity_email = emailInput ? emailInput.value : state.minerIdentityEmail;
  const app_user_selected_amount = amountInput ? amountInput.value : state.selectedAmount;
  
  const count = state.minedBlabs.length;
  let totalNewReward = 0;
  
  while (state.minedBlabs.length > 0) {
    const blab = state.minedBlabs.shift();
    const result = processConversionAlgorithm(blab, miner_identity_email, app_user_selected_amount);
    totalNewReward += parseFloat(result.rewardOutput);
    logTerminal(result.outputResponse, 'convert');
  }
  
  state.totalConverted += totalNewReward;
  logTerminal(`[CONVERT] Batch complete! Processed ${count} BLAB items. Total yield: +${totalNewReward.toFixed(6)} BTC`, 'system');
  updateUI();
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header>
      <div class="brand">
        <div class="logo-icon">₿</div>
        <div>
          <h1>BitMiner</h1>
          <p style="font-size: 0.8rem; color: var(--text-muted);">BLAB Encrypted Crypto Miner & Converter</p>
        </div>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <button id="install-pwa" class="install-pwa-btn">⚡ Install App</button>
        <nav class="nav-menu">
          <button class="nav-btn ${state.activeTab === 'mine' ? 'active' : ''}" id="tab-mine">Mine</button>
          <button class="nav-btn ${state.activeTab === 'convert' ? 'active' : ''}" id="tab-convert">Convert</button>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <!-- Left Control Panel -->
      <div class="panel">
        ${state.activeTab === 'mine' ? `
          <div class="panel-title">
            <span>Mining Operation</span>
            <span class="badge">${state.isMining ? 'ACTIVE' : 'IDLE'}</span>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Hashrate</div>
              <div class="stat-value">${state.hashRate} MH/s</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Blocks Mined</div>
              <div class="stat-value">${state.blocksMined}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pending BLABs</div>
              <div class="stat-value">${state.minedBlabs.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Converted</div>
              <div class="stat-value">${state.totalConverted.toFixed(4)} BTC</div>
            </div>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
            <button class="btn" id="toggle-miner" style="flex: 1;">
              ${state.isMining ? 'Pause Miner' : 'Start Miner'}
            </button>
          </div>
          <label class="toggle-container" style="margin-top: 0.5rem;">
            <input type="checkbox" id="auto-convert-toggle" ${state.autoConvert ? 'checked' : ''} />
            <span style="font-size: 0.9rem;">Enable Instant Auto-Conversion for generated BLABs</span>
          </label>
        ` : `
          <div class="panel-title">
            <span>Conversion Configuration</span>
            <span class="badge">QUEUE: ${state.minedBlabs.length}</span>
          </div>
          <div class="form-group">
            <label for="email-input">Miner Identity Email [miner_identity_email]</label>
            <input type="text" id="email-input" value="${state.minerIdentityEmail}" placeholder="user@bitminer.net" />
          </div>
          <div class="form-group">
            <label for="amount-input">Conversion Amount per BLAB [app_user_selected_amount]</label>
            <select id="amount-input">
              <option value="0.01" ${state.selectedAmount === '0.01' ? 'selected' : ''}>0.01 BTC</option>
              <option value="0.05" ${state.selectedAmount === '0.05' ? 'selected' : ''}>0.05 BTC</option>
              <option value="0.10" ${state.selectedAmount === '0.10' ? 'selected' : ''}>0.10 BTC</option>
              <option value="0.50" ${state.selectedAmount === '0.50' ? 'selected' : ''}>0.50 BTC</option>
            </select>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
            <button class="btn" id="btn-convert-all" style="flex: 1;">Convert All BLABs</button>
          </div>
        `}
      </div>

      <!-- Right Terminal Feed -->
      <div class="panel">
        <div class="panel-title">
          <span>Live Feed Terminal</span>
          <button class="btn btn-secondary" id="clear-terminal" style="padding: 0.3rem 0.75rem; font-size: 0.8rem;">Clear Logs</button>
        </div>
        <div class="feed-terminal" id="feed-terminal"></div>
      </div>
    </main>
  `;

  bindEvents();
  restoreTerminalLogs();
}

function restoreTerminalLogs() {
  const terminal = document.getElementById('feed-terminal');
  if (!terminal) return;
  terminal.innerHTML = '';
  state.feedLogs.forEach(log => {
    const line = document.createElement('div');
    line.className = `terminal-line ${log.type}`;
    line.textContent = log.text;
    terminal.appendChild(line);
  });
  terminal.scrollTop = terminal.scrollHeight;
}

function bindEvents() {
  const tabMine = document.getElementById('tab-mine');
  const tabConvert = document.getElementById('tab-convert');
  
  if (tabMine) tabMine.onclick = () => { state.activeTab = 'mine'; renderApp(); };
  if (tabConvert) tabConvert.onclick = () => { state.activeTab = 'convert'; renderApp(); };
  
  const toggleMinerBtn = document.getElementById('toggle-miner');
  if (toggleMinerBtn) {
    toggleMinerBtn.onclick = () => {
      if (state.isMining) stopMining(); else startMining();
    };
  }
  
  const autoConvertToggle = document.getElementById('auto-convert-toggle');
  if (autoConvertToggle) {
    autoConvertToggle.onchange = (e) => { state.autoConvert = e.target.checked; };
  }
  
  const emailInput = document.getElementById('email-input');
  if (emailInput) {
    emailInput.onchange = (e) => { state.minerIdentityEmail = e.target.value; };
  }
  
  const amountInput = document.getElementById('amount-input');
  if (amountInput) {
    amountInput.onchange = (e) => { state.selectedAmount = e.target.value; };
  }
  
  const convertAllBtn = document.getElementById('btn-convert-all');
  if (convertAllBtn) {
    convertAllBtn.onclick = manualConvertAll;
  }
  
  const clearTerminalBtn = document.getElementById('clear-terminal');
  if (clearTerminalBtn) {
    clearTerminalBtn.onclick = () => {
      state.feedLogs = [];
      restoreTerminalLogs();
    };
  }

  const installBtn = document.getElementById('install-pwa');
  if (installBtn && state.installPrompt) {
    installBtn.style.display = 'inline-block';
    installBtn.onclick = () => {
      state.installPrompt.prompt();
      state.installPrompt.userChoice.then(() => {
        state.installPrompt = null;
        installBtn.style.display = 'none';
      });
    };
  }
}

function updateUI() {
  renderApp();
}

// PWA Registration & Install Prompt Event
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg error:', err));
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.installPrompt = e;
  const installBtn = document.getElementById('install-pwa');
  if (installBtn) installBtn.style.display = 'inline-block';
});

// Initialize App
console.log('BitMiner application initialized');
logTerminal('BitMiner platform initialized. Ready to mine cryptographic data.', 'system');
renderApp();
