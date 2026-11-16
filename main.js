import './style.css';

// Core State & Variables
// Key variables explicitly utilized: [blab], [miner_identity_email], and [app_user_selected_amount]
let miner_identity_email = 'miner.node741@bitminer.network';
let app_user_selected_amount = 0.05;
let blab = '';

let isMining = false;
let autoConvert = true;
let miningInterval = null;
let hashrate = 42.8;
let totalMinedCount = 0;
let totalConvertedCount = 0;
let totalPayoutEarned = 0.0;
let activeTab = 'mine'; // 'mine' | 'convert'
let deferredPrompt = null;

// Persistent Store of Mined Data Items
let minedStore = [
  {
    id: 'block-001',
    miner_identity_email: 'miner.node741@bitminer.network',
    email_base64: btoa('miner.node741@bitminer.network'),
    key_value_base64: btoa('key-0x9a4f21d8b74c'),
    blab: btoa('miner.node741@bitminer.network') + '.' + btoa('key-0x9a4f21d8b74c'),
    status: 'converted',
    app_user_selected_amount: 0.05,
    converted_value: 0.05,
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString()
  }
];

totalMinedCount = minedStore.length;
totalConvertedCount = 1;
totalPayoutEarned = 0.05;

// Terminal Feed Log Queue
const terminalLogs = [
  {
    time: new Date(Date.now() - 65000).toLocaleTimeString(),
    type: 'system',
    prefix: '[SYS]',
    content: 'BitMiner Terminal engine v2.4 online. Linear gradient render active.'
  },
  {
    time: new Date(Date.now() - 60000).toLocaleTimeString(),
    type: 'mine',
    prefix: '[MINE]',
    content: 'Initial genesis blab generated: ' + minedStore[0].blab
  },
  {
    time: new Date(Date.now() - 59000).toLocaleTimeString(),
    type: 'convert',
    prefix: '[CONV]',
    content: `Converted blab for ${minedStore[0].miner_identity_email} with amount ${minedStore[0].app_user_selected_amount} BTC`
  }
];

function appendTerminalLog(type, prefix, content) {
  const time = new Date().toLocaleTimeString();
  terminalLogs.push({ time, type, prefix, content });
  if (terminalLogs.length > 150) {
    terminalLogs.shift();
  }
  renderTerminal();
}

// Generator for valid email addresses in Base64
function generateRandomMinerEmail() {
  const prefixes = ['node.alpha', 'miner.krypto', 'sat.core', 'hash.runner', 'block.forge', 'quantum.rig'];
  const domains = ['bitminer.network', 'chainlink.io', 'proof-of-work.org', 'skokos-crypto.com'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomId = Math.floor(100 + Math.random() * 900);
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomPrefix}${randomId}@${randomDomain}`;
}

// Key Value Generator (Base64)
function generateBase64Key() {
  const randHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const rawKey = `key-0x${randHex}`;
  return btoa(rawKey);
}

// Processing Algorithm for Mining
function processSingleMiningIteration() {
  // 1. Auto generate valid email address in base64 encryption
  const generatedEmail = generateRandomMinerEmail();
  const emailBase64 = btoa(generatedEmail);

  // 2. Generate a base64 key value
  const keyBase64 = generateBase64Key();

  // 3. Combine the two generated base64 elements into final combination [blab]
  blab = `${emailBase64}.${keyBase64}`;

  totalMinedCount++;
  hashrate = (38.0 + Math.random() * 12.5).toFixed(1);

  const blockItem = {
    id: 'block-' + String(totalMinedCount).padStart(3, '0'),
    miner_identity_email: miner_identity_email || generatedEmail,
    email_base64: emailBase64,
    key_value_base64: keyBase64,
    blab: blab,
    status: 'pending',
    app_user_selected_amount: parseFloat(app_user_selected_amount) || 0.05,
    converted_value: 0,
    timestamp: new Date().toLocaleTimeString()
  };

  minedStore.unshift(blockItem);

  appendTerminalLog(
    'mine',
    '[MINE]',
    `Mined BLAB [${blab.slice(0, 24)}...] from identity ${blockItem.miner_identity_email}`
  );

  // If Auto-convert functionality is enabled, process conversion immediately
  if (autoConvert) {
    processConversionAlgorithm(blockItem);
  }

  updateStatsUI();
  renderBlabStream();
}

// Processing Algorithm for Conversion using [blab], [miner_identity_email] and [app_user_selected_amount]
function processConversionAlgorithm(targetItem) {
  if (!targetItem || targetItem.status === 'converted') return;

  // Use core variable [blab]
  const currentBlab = targetItem.blab;

  // Use core variable [miner_identity_email]
  const identity = miner_identity_email || targetItem.miner_identity_email;

  // Use core variable [app_user_selected_amount]
  const amount = parseFloat(app_user_selected_amount) || targetItem.app_user_selected_amount || 0.05;

  // Conversion calculation: reward based on blab complexity and user selected amount
  const blabEntropyFactor = (currentBlab.charCodeAt(0) % 5 + 1) / 100;
  const rewardCalc = parseFloat((amount * (1 + blabEntropyFactor)).toFixed(6));

  targetItem.status = 'converted';
  targetItem.miner_identity_email = identity;
  targetItem.app_user_selected_amount = amount;
  targetItem.converted_value = rewardCalc;

  totalConvertedCount++;
  totalPayoutEarned = parseFloat((totalPayoutEarned + rewardCalc).toFixed(6));

  appendTerminalLog(
    'convert',
    '[CONV]',
    `SUCCESS: Converted blab (${currentBlab.slice(0, 18)}...) for [${identity}]. Payout: +${rewardCalc} BTC (@ rate ${amount} / blab)`
  );
}

// Convert all pending blabs manually
function convertAllPendingBlabs() {
  const pending = minedStore.filter((item) => item.status === 'pending');
  if (pending.length === 0) {
    appendTerminalLog('warn', '[WARN]', 'No pending base64 blabs to convert.');
    return;
  }

  appendTerminalLog('system', '[CONV]', `Batch converting ${pending.length} pending base64 blab item(s)...`);
  pending.forEach((item) => {
    processConversionAlgorithm(item);
  });
  updateStatsUI();
  renderBlabStream();
}

// Toggle Mining Execution
function toggleMining() {
  isMining = !isMining;
  const mineBtn = document.getElementById('toggle-mine-btn');

  if (isMining) {
    appendTerminalLog('system', '[START]', 'Mining thread activated. Auto-generating Base64 encrypted emails and key pairs.');
    miningInterval = setInterval(() => {
      processSingleMiningIteration();
    }, 2800);
    if (mineBtn) {
      mineBtn.textContent = '⏹ Stop Mining Rig';
      mineBtn.className = 'btn-danger';
    }
  } else {
    clearInterval(miningInterval);
    miningInterval = null;
    appendTerminalLog('warn', '[STOP]', 'Mining thread suspended by user.');
    if (mineBtn) {
      mineBtn.textContent = '⚡ Start Mining Rig';
      mineBtn.className = 'btn-primary';
    }
  }
}

// UI Rendering Functions
function updateStatsUI() {
  const elMined = document.getElementById('stat-mined');
  const elConverted = document.getElementById('stat-converted');
  const elPayout = document.getElementById('stat-payout');
  const elHashrate = document.getElementById('stat-hashrate');

  if (elMined) elMined.textContent = totalMinedCount;
  if (elConverted) elConverted.textContent = totalConvertedCount;
  if (elPayout) elPayout.textContent = totalPayoutEarned.toFixed(4) + ' BTC';
  if (elHashrate) elHashrate.textContent = isMining ? `${hashrate} MH/s` : '0.0 MH/s';
}

function renderTerminal() {
  const terminalBody = document.getElementById('terminal-logs');
  if (!terminalBody) return;

  terminalBody.innerHTML = terminalLogs
    .map((log) => {
      let prefixClass = 'prefix-system';
      if (log.type === 'mine') prefixClass = 'prefix-mine';
      if (log.type === 'convert') prefixClass = 'prefix-convert';
      if (log.type === 'warn') prefixClass = 'prefix-warn';

      return `
        <div class="terminal-line">
          <span class="terminal-time">[${log.time}]</span>
          <span class="terminal-prefix ${prefixClass}">${log.prefix}</span>
          <span class="terminal-content">${log.content}</span>
        </div>
      `;
    })
    .join('');

  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function renderBlabStream() {
  const container = document.getElementById('blab-stream');
  if (!container) return;

  if (minedStore.length === 0) {
    container.innerHTML = '<div style="color: #64748b; font-size: 0.8rem;">No blabs in memory yet.</div>';
    return;
  }

  container.innerHTML = minedStore
    .slice(0, 10)
    .map((item) => `
      <div class="blab-item ${item.status}">
        <div class="blab-header">
          <span>${item.id} &bull; ${item.timestamp}</span>
          <span class="badge ${item.status === 'converted' ? 'badge-green' : 'badge-purple'}">
            ${item.status.toUpperCase()}
          </span>
        </div>
        <div class="blab-code"><strong>blab:</strong> ${item.blab}</div>
        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.2rem;">
          Miner: ${item.miner_identity_email} | Amount: ${item.app_user_selected_amount} BTC
        </div>
      </div>
    `)
    .join('');
}

// Export JSON File
function exportBlabsJson() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(minedStore, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `bitminer-blabs-${Date.now()}.json`);
  dlAnchor.click();
  appendTerminalLog('system', '[DATA]', `Exported ${minedStore.length} blabs to local JSON file.`);
}

// Main Application View Markup
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-container">
      <!-- Top Navigation Bar with Gradient Theme -->
      <header class="top-navbar">
        <div class="brand">
          <div class="brand-icon">&#9889;</div>
          <div class="brand-text">
            <h1>BitMiner</h1>
            <span>Base64 Cryptographic Blab Engine</span>
          </div>
        </div>

        <nav class="nav-tabs" role="tablist">
          <button class="nav-btn ${activeTab === 'mine' ? 'active' : ''}" id="tab-mine-btn" role="tab">
            &#9874; Mine
          </button>
          <button class="nav-btn ${activeTab === 'convert' ? 'active' : ''}" id="tab-convert-btn" role="tab">
            &#8644; Convert
          </button>
        </nav>

        <button class="pwa-install-btn" id="pwa-btn" style="display: none;">
          &#10515; Install PWA
        </button>
      </header>

      <!-- Metric Highlights -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Mined Blabs</div>
          <div class="stat-value" id="stat-mined">${totalMinedCount}</div>
          <div class="stat-sub">Base64 Encrypted Pairs</div>
        </div>
        <div class="stat-card alt">
          <div class="stat-label">Hashrate</div>
          <div class="stat-value" id="stat-hashrate">${isMining ? hashrate + ' MH/s' : '0.0 MH/s'}</div>
          <div class="stat-sub">SHA-256 Entropy Rig</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Converted Blabs</div>
          <div class="stat-value" id="stat-converted">${totalConvertedCount}</div>
          <div class="stat-sub">Auto &amp; Manual Processed</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Total Payout Earned</div>
          <div class="stat-value" id="stat-payout">${totalPayoutEarned.toFixed(4)} BTC</div>
          <div class="stat-sub">Credited to Miner Email</div>
        </div>
      </section>

      <!-- Interactive Workspace Split: Controls and Terminal Feed -->
      <main class="content-grid">
        <!-- Dynamic Tab Panel -->
        <div id="tab-panel">
          ${renderTabContent()}
        </div>

        <!-- Feed Terminal -->
        <div class="terminal-card">
          <div class="terminal-header">
            <div class="terminal-controls">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="terminal-title">feed-terminal://blab-output.log</span>
            <button class="btn-primary btn-sm" id="clear-terminal-btn" style="padding: 0.25rem 0.6rem; font-size: 0.72rem;">
              Clear
            </button>
          </div>
          <div class="terminal-body" id="terminal-logs"></div>
        </div>
      </main>

      <!-- Mined Blabs JSON Record Stream -->
      <section style="margin-top: 1.5rem; background: var(--gradient-card); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-bright); display: flex; align-items: center; gap: 0.5rem;">
            &#128196; Real-Time Blab JSON Data Store
            <span class="badge badge-cyan">${minedStore.length} items</span>
          </h3>
          <button class="btn-secondary btn-sm" id="export-json-btn">
            &#10515; Export JSON Dataset
          </button>
        </div>
        <div class="blab-stream-list" id="blab-stream"></div>
      </section>

      <footer class="app-footer">
        BitMiner Cryptographic Rig &bull; Linear Gradient Color Scheme &bull; PWA Ready
      </footer>
    </div>
  `;

  bindEvents();
  renderTerminal();
  renderBlabStream();
}

function renderTabContent() {
  if (activeTab === 'mine') {
    return `
      <div class="action-card">
        <div class="card-header">
          <div class="card-title">
            <span>&#9874;</span> Cryptocurrency Miner
          </div>
          <span class="badge badge-purple">Base64 Keygen Active</span>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted);">
          When mining is triggered, BitMiner automatically creates a valid email address in Base64 encryption, generates a matching Base64 key value, and combines both into the singular cryptographic <strong>[blab]</strong> string.
        </p>

        <div class="form-group">
          <label class="form-label" for="miner-email-input">Miner Identity Email [miner_identity_email]</label>
          <input
            type="email"
            id="miner-email-input"
            class="input-field"
            value="${miner_identity_email}"
            placeholder="e.g. miner.core@bitminer.network"
          />
          <span class="field-hint">Identity attached to all newly generated blabs and payout processing.</span>
        </div>

        <div class="toggle-wrapper">
          <div class="toggle-label-group">
            <span class="toggle-title">Auto-Convert Mined Blabs</span>
            <span class="toggle-desc">Instantly process each generated blab into output terminal responses</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="auto-convert-toggle" ${autoConvert ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button id="toggle-mine-btn" class="${isMining ? 'btn-danger' : 'btn-primary'}" style="flex: 1;">
            ${isMining ? '⏹ Stop Mining Rig' : '⚡ Start Mining Rig'}
          </button>
          <button id="mine-single-btn" class="btn-secondary" style="flex: 1;">
            &#10022; Mine Single Blab
          </button>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="action-card">
        <div class="card-header">
          <div class="card-title">
            <span>&#8644;</span> Convert Mined Data
          </div>
          <span class="badge badge-green">Feed Processor Ready</span>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Configure your conversion parameters. The processing algorithm parses each <strong>[blab]</strong> together with <strong>[miner_identity_email]</strong> and calculates payout using <strong>[app_user_selected_amount]</strong>.
        </p>

        <div class="form-group">
          <label class="form-label" for="convert-email-input">Target Miner Email [miner_identity_email]</label>
          <input
            type="email"
            id="convert-email-input"
            class="input-field"
            value="${miner_identity_email}"
            placeholder="miner@domain.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="convert-amount-input">Conversion Amount Per Blab [app_user_selected_amount]</label>
          <input
            type="number"
            id="convert-amount-input"
            class="input-field"
            step="0.005"
            min="0.001"
            max="10"
            value="${app_user_selected_amount}"
          />
          <span class="field-hint">Base BTC conversion amount assigned to each singular processed blab.</span>
        </div>

        <div class="toggle-wrapper">
          <div class="toggle-label-group">
            <span class="toggle-title">Auto-Convert Listener</span>
            <span class="toggle-desc">Automatically converts data as it populates the store</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="auto-convert-toggle-2" ${autoConvert ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button id="convert-all-btn" class="btn-primary" style="flex: 1;">
            &#8644; Convert All Pending Blabs
          </button>
        </div>
      </div>
    `;
  }
}

function bindEvents() {
  // Tabs
  const tabMine = document.getElementById('tab-mine-btn');
  const tabConvert = document.getElementById('tab-convert-btn');

  if (tabMine) {
    tabMine.addEventListener('click', () => {
      activeTab = 'mine';
      renderApp();
    });
  }

  if (tabConvert) {
    tabConvert.addEventListener('click', () => {
      activeTab = 'convert';
      renderApp();
    });
  }

  // Mine Controls
  const toggleMineBtn = document.getElementById('toggle-mine-btn');
  if (toggleMineBtn) {
    toggleMineBtn.addEventListener('click', toggleMining);
  }

  const mineSingleBtn = document.getElementById('mine-single-btn');
  if (mineSingleBtn) {
    mineSingleBtn.addEventListener('click', () => {
      processSingleMiningIteration();
    });
  }

  const minerEmailInput = document.getElementById('miner-email-input');
  if (minerEmailInput) {
    minerEmailInput.addEventListener('input', (e) => {
      miner_identity_email = e.target.value.trim();
    });
  }

  // Convert Controls
  const convertEmailInput = document.getElementById('convert-email-input');
  if (convertEmailInput) {
    convertEmailInput.addEventListener('input', (e) => {
      miner_identity_email = e.target.value.trim();
    });
  }

  const convertAmountInput = document.getElementById('convert-amount-input');
  if (convertAmountInput) {
    convertAmountInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      app_user_selected_amount = isNaN(val) ? 0.05 : val;
    });
  }

  const convertAllBtn = document.getElementById('convert-all-btn');
  if (convertAllBtn) {
    convertAllBtn.addEventListener('click', convertAllPendingBlabs);
  }

  // Auto convert toggle listeners
  const autoToggle1 = document.getElementById('auto-convert-toggle');
  if (autoToggle1) {
    autoToggle1.addEventListener('change', (e) => {
      autoConvert = e.target.checked;
      appendTerminalLog('system', '[SYS]', `Auto-convert mode: ${autoConvert ? 'ENABLED' : 'DISABLED'}`);
    });
  }

  const autoToggle2 = document.getElementById('auto-convert-toggle-2');
  if (autoToggle2) {
    autoToggle2.addEventListener('change', (e) => {
      autoConvert = e.target.checked;
      appendTerminalLog('system', '[SYS]', `Auto-convert mode: ${autoConvert ? 'ENABLED' : 'DISABLED'}`);
    });
  }

  // Clear Terminal
  const clearBtn = document.getElementById('clear-terminal-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      terminalLogs.length = 0;
      appendTerminalLog('system', '[SYS]', 'Terminal log cleared.');
    });
  }

  // Export JSON
  const exportBtn = document.getElementById('export-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportBlabsJson);
  }

  // PWA Install
  const pwaBtn = document.getElementById('pwa-btn');
  if (pwaBtn && deferredPrompt) {
    pwaBtn.style.display = 'inline-flex';
    pwaBtn.onclick = async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      appendTerminalLog('system', '[PWA]', `User install prompt outcome: ${outcome}`);
      deferredPrompt = null;
      pwaBtn.style.display = 'none';
    };
  }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const pwaBtn = document.getElementById('pwa-btn');
  if (pwaBtn) pwaBtn.style.display = 'inline-flex';
});

// Initialize App
renderApp();
console.log('BitMiner application initialized with linear-gradient and blab processing algorithm.');
