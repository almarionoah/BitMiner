// BitMiner Application Engine
// Implements Base64 Email Generation, Blab Creation, Conversion Engine, Terminal Feed, and PWA integration.

let activeTab = 'mine';
let isMining = false;
let miningInterval = null;
let autoConvert = false;
let deferredPrompt = null;

// Core State
let miner_identity_email = '';
let currentBlabs = [];
let app_user_selected_amount = 100;
let stats = {
  hashRate: 0,
  minedBlocks: 0,
  convertedTokens: 0,
  totalBlabs: 0
};

// Helpers for Base64 and data generation
function generateBase64Email() {
  const domains = ['bitminer.net', 'satoshimain.org', 'crypto-node.io', 'hashpool.com'];
  const randomString = Math.random().toString(36).substring(2, 9);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const rawEmail = `miner_${randomString}@${domain}`;
  return btoa(rawEmail);
}

function generateBase64Key() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const str = Array.from(array, byte => String.fromCharCode(byte)).join('');
  return btoa(str);
}

// Generates singular processed final base64 string combination [blab]
function generateBlab(encryptedEmail) {
  const key = generateBase64Key();
  const rawBlabCombo = `${encryptedEmail}:${key}:${Date.now()}`;
  const blab = btoa(rawBlabCombo);
  return { blab, key };
}

function logToTerminal(message, type = 'info') {
  const terminal = document.getElementById('feedTerminal');
  if (!terminal) return;
  
  const timestamp = new Date().toISOString().substring(11, 19);
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.innerHTML = `<span style="color:#64748b;">[${timestamp}]</span> ${message}`;
  
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

// Conversion algorithm processing logic
function processConversion(blab, email, amount) {
  if (!blab) return null;
  
  // Core variable utilization verification and processing
  const miner_identity_email = email || btoa('default_miner@bitminer.net');
  const app_user_selected_amount = Number(amount) || 1;
  
  try {
    const decodedBlab = atob(blab);
    const decodedEmail = atob(miner_identity_email);
    const conversionFactor = 0.00042;
    const convertedValue = (app_user_selected_amount * conversionFactor).toFixed(6);
    
    return {
      success: true,
      decodedEmail,
      blab,
      amount: app_user_selected_amount,
      convertedValue,
      hashSignature: btoa(`${blab}-${miner_identity_email}-${app_user_selected_amount}`).substring(0, 18)
    };
  } catch (e) {
    return {
      success: false,
      error: 'Invalid Base64 blab combination payload'
    };
  }
}

function startMining() {
  if (isMining) return;
  isMining = true;
  updateUI();
  logToTerminal('Mining worker thread initialized.', 'info');
  
  // Generate or ensure miner identity email in Base64
  if (!miner_identity_email) {
    miner_identity_email = generateBase64Email();
    const emailInput = document.getElementById('minerEmailInput');
    if (emailInput) emailInput.value = miner_identity_email;
  }
  
  logToTerminal(`Miner identity established: ${miner_identity_email.substring(0, 16)}...`, 'mine');

  miningInterval = setInterval(() => {
    // Auto generate key and combine with encrypted email to produce [blab]
    const { blab, key } = generateBlab(miner_identity_email);
    currentBlabs.push(blab);
    stats.minedBlocks += 1;
    stats.totalBlabs += 1;
    stats.hashRate = Math.floor(Math.random() * 45) + 120;
    
    logToTerminal(`Mined Block BLAB: [${blab.substring(0, 24)}...] Key: ${key.substring(0, 10)}`, 'mine');
    
    if (autoConvert) {
      executeSingleConversion(blab);
    }
    
    updateStats();
  }, 2500);
}

function stopMining() {
  isMining = false;
  if (miningInterval) clearInterval(miningInterval);
  stats.hashRate = 0;
  updateUI();
  updateStats();
  logToTerminal('Mining execution paused by user.', 'warn');
}

function executeSingleConversion(blabToConvert) {
  const targetBlab = blabToConvert || (currentBlabs.length > 0 ? currentBlabs.shift() : null);
  const emailVal = miner_identity_email || document.getElementById('minerEmailInput')?.value || generateBase64Email();
  const amountVal = app_user_selected_amount || document.getElementById('amountInput')?.value || 100;
  
  if (!targetBlab) {
    logToTerminal('No mined blab data available in queue to convert.', 'warn');
    return;
  }
  
  const result = processConversion(targetBlab, emailVal, amountVal);
  if (result && result.success) {
    stats.convertedTokens += Number(result.convertedValue);
    logToTerminal(`[CONVERT SUCCESS] Email: ${result.decodedEmail} | Blab: ${result.blab.substring(0, 14)}... | Qty: ${result.amount} -> ${result.convertedValue} BITC`, 'success');
    updateStats();
  } else {
    logToTerminal(`[CONVERT FAILED] ${result?.error || 'Unknown error'}`, 'warn');
  }
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="header">
      <div class="brand">
        <div class="brand-icon">⚡</div>
        <div>
          <div class="brand-title">BitMiner</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Crypto Base64 Blab Processing Node</div>
        </div>
      </div>
      <nav class="nav-menu">
        <button id="navMine" class="nav-btn ${activeTab === 'mine' ? 'active' : ''}">Mine</button>
        <button id="navConvert" class="nav-btn ${activeTab === 'convert' ? 'active' : ''}">Convert</button>
      </nav>
    </header>

    <div id="pwaInstallBanner" class="pwa-banner" style="display: none;">
      <span>📲 Install BitMiner App for offline access and auto-mining capability!</span>
      <button id="pwaInstallBtn" class="btn-secondary">Install App</button>
    </div>

    <main class="main-layout">
      <div class="panel">
        <div class="panel-header">
          <span>${activeTab === 'mine' ? '⛏️ Mining Engine' : '🔄 Blab Conversion Center'}</span>
          <span id="statusBadge" class="badge ${isMining ? 'badge-active' : 'badge-idle'}">
            ${isMining ? 'ACTIVE MINING' : 'STANDBY'}
          </span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Hash Rate</span>
            <span id="hashRateVal" class="stat-value">${stats.hashRate} MH/s</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Mined Blabs</span>
            <span id="minedBlocksVal" class="stat-value">${stats.minedBlocks}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Converted Tokens</span>
            <span id="convertedVal" class="stat-value">${stats.convertedTokens.toFixed(4)} BITC</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Blabs in Queue</span>
            <span id="queueVal" class="stat-value">${currentBlabs.length}</span>
          </div>
        </div>

        ${activeTab === 'mine' ? `
          <div class="form-group">
            <label for="minerEmailInput">Miner Identity (Base64 Encrypted Email)</label>
            <input type="text" id="minerEmailInput" value="${miner_identity_email}" placeholder="Auto-generated base64 email" />
          </div>

          <div style="display:flex; gap:1rem;">
            <button id="toggleMineBtn" class="btn-primary">
              ${isMining ? 'Pause Mining' : 'Start Mining'}
            </button>
          </div>
        ` : `
          <div class="form-group">
            <label for="minerEmailInput">Miner Identity Email (Base64 string)</label>
            <input type="text" id="minerEmailInput" value="${miner_identity_email}" placeholder="Base64 miner identity email" />
          </div>

          <div class="form-group">
            <label for="amountInput">Blab Conversion Amount [app_user_selected_amount]</label>
            <input type="number" id="amountInput" value="${app_user_selected_amount}" min="1" max="10000" />
          </div>

          <div class="toggle-container">
            <span style="font-weight:600; font-size:0.9rem;">Auto-Convert Live Blabs</span>
            <label class="toggle-switch">
              <input type="checkbox" id="autoConvertToggle" ${autoConvert ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>

          <button id="convertBtn" class="btn-primary">
            Convert Next Blab
          </button>
        `}
      </div>

      <div class="terminal-panel">
        <div class="terminal-bar">
          <div class="terminal-dots">
            <div class="dot dot-red"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
          </div>
          <div class="terminal-title">feed-terminal // bitminer.log</div>
          <button id="clearLogsBtn" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem;">Clear</button>
        </div>
        <div id="feedTerminal" class="feed-terminal">
          <div class="log-line log-info">[SYSTEM] BitMiner v1.0.0 initializing...</div>
          <div class="log-line log-info">[SYSTEM] Ready for mining and base64 blab conversion.</div>
        </div>
      </div>
    </main>
  `;

  bindEvents();
}

function bindEvents() {
  document.getElementById('navMine')?.addEventListener('click', () => {
    activeTab = 'mine';
    renderApp();
  });

  document.getElementById('navConvert')?.addEventListener('click', () => {
    activeTab = 'convert';
    renderApp();
  });

  document.getElementById('toggleMineBtn')?.addEventListener('click', () => {
    if (isMining) stopMining();
    else startMining();
  });

  document.getElementById('minerEmailInput')?.addEventListener('input', (e) => {
    miner_identity_email = e.target.value;
  });

  document.getElementById('amountInput')?.addEventListener('input', (e) => {
    app_user_selected_amount = Number(e.target.value) || 1;
  });

  document.getElementById('autoConvertToggle')?.addEventListener('change', (e) => {
    autoConvert = e.target.checked;
    logToTerminal(`Auto-convert functionality turned ${autoConvert ? 'ON' : 'OFF'}.`, 'info');
  });

  document.getElementById('convertBtn')?.addEventListener('click', () => {
    executeSingleConversion();
  });

  document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
    const terminal = document.getElementById('feedTerminal');
    if (terminal) terminal.innerHTML = '';
  });

  document.getElementById('pwaInstallBtn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        document.getElementById('pwaInstallBanner').style.display = 'none';
      }
      deferredPrompt = null;
    }
  });
}

function updateUI() {
  const toggleBtn = document.getElementById('toggleMineBtn');
  if (toggleBtn) toggleBtn.textContent = isMining ? 'Pause Mining' : 'Start Mining';
  
  const statusBadge = document.getElementById('statusBadge');
  if (statusBadge) {
    statusBadge.className = `badge ${isMining ? 'badge-active' : 'badge-idle'}`;
    statusBadge.textContent = isMining ? 'ACTIVE MINING' : 'STANDBY';
  }
}

function updateStats() {
  const hashRate = document.getElementById('hashRateVal');
  const minedBlocks = document.getElementById('minedBlocksVal');
  const converted = document.getElementById('convertedVal');
  const queue = document.getElementById('queueVal');
  
  if (hashRate) hashRate.textContent = `${stats.hashRate} MH/s`;
  if (minedBlocks) minedBlocks.textContent = `${stats.minedBlocks}`;
  if (converted) converted.textContent = `${stats.convertedTokens.toFixed(4)} BITC`;
  if (queue) queue.textContent = `${currentBlabs.length}`;
}

// PWA Service Worker Registration & Installation Prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => console.log('ServiceWorker registered:', reg.scope),
      (err) => console.log('ServiceWorker registration failed:', err)
    );
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('pwaInstallBanner');
  if (banner) banner.style.display = 'flex';
});

// Initialize initial render
miner_identity_email = generateBase64Email();
renderApp();
console.log('BitMiner application initialized');