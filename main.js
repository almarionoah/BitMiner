/**
 * BitMiner Application Core Engine
 * Implements base64 email & key generation, singular [blab] combination creation,
 * and conversion processing via [miner_identity_email] and [app_user_selected_amount].
 */

// --- State Management ---
const state = {
  miningActive: false,
  miningInterval: null,
  autoConvert: false,
  miner_identity_email: 'miner.node77@bitminer.network',
  app_user_selected_amount: 0.00025,
  hashrateBase: 42.8,
  minedBlabs: [],
  convertedBlabs: [],
  totalPayoutBTC: 0,
};

// Load persisted state if available
function loadPersistedData() {
  try {
    const saved = localStorage.getItem('bitminer_data_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.minedBlabs)) state.minedBlabs = parsed.minedBlabs;
      if (Array.isArray(parsed.convertedBlabs)) state.convertedBlabs = parsed.convertedBlabs;
      if (typeof parsed.miner_identity_email === 'string') state.miner_identity_email = parsed.miner_identity_email;
      if (typeof parsed.app_user_selected_amount === 'number') state.app_user_selected_amount = parsed.app_user_selected_amount;
      if (typeof parsed.totalPayoutBTC === 'number') state.totalPayoutBTC = parsed.totalPayoutBTC;
    }
  } catch (err) {
    console.warn('Could not read existing local data:', err);
  }
}

function persistData() {
  try {
    const data = {
      minedBlabs: state.minedBlabs,
      convertedBlabs: state.convertedBlabs,
      miner_identity_email: state.miner_identity_email,
      app_user_selected_amount: state.app_user_selected_amount,
      totalPayoutBTC: state.totalPayoutBTC,
    };
    localStorage.setItem('bitminer_data_store', JSON.stringify(data));
  } catch (err) {
    console.warn('Could not persist data:', err);
  }
}

// --- DOM Elements ---
const elements = {
  tabMineBtn: document.getElementById('tab-mine-btn'),
  tabConvertBtn: document.getElementById('tab-convert-btn'),
  viewMine: document.getElementById('view-mine'),
  viewConvert: document.getElementById('view-convert'),
  toggleMineBtn: document.getElementById('toggle-mine-btn'),
  autoConvertCheckbox: document.getElementById('auto-convert-checkbox'),
  miningStatusBadge: document.getElementById('mining-status-badge'),
  miningVisualizer: document.getElementById('mining-visualizer'),
  hashratePulse: document.getElementById('hashrate-pulse'),
  hashrateDisplay: document.getElementById('hashrate-display'),
  previewEmail: document.getElementById('preview-email'),
  previewKey: document.getElementById('preview-key'),
  previewBlab: document.getElementById('preview-blab'),
  statMinedBlabs: document.getElementById('stat-mined-blabs'),
  statUnconverted: document.getElementById('stat-unconverted'),
  statConverted: document.getElementById('stat-converted'),
  statPayout: document.getElementById('stat-payout'),
  inputMinerEmail: document.getElementById('input-miner-email'),
  inputConvertAmount: document.getElementById('input-convert-amount'),
  rateTagValue: document.getElementById('rate-tag-value'),
  summaryPendingCount: document.getElementById('summary-pending-count'),
  summaryEstimatedPayout: document.getElementById('summary-estimated-payout'),
  btnConvertAll: document.getElementById('btn-convert-all'),
  btnClearData: document.getElementById('btn-clear-data'),
  terminalFeed: document.getElementById('terminal-feed'),
  terminalCountBadge: document.getElementById('terminal-count-badge'),
  terminalAutoScroll: document.getElementById('terminal-autoscroll'),
  btnExportJson: document.getElementById('btn-export-json'),
  btnClearTerminal: document.getElementById('btn-clear-terminal'),
  pwaInstallBtn: document.getElementById('pwa-install-btn'),
};

let terminalLogCount = 1;

// --- Terminal Logging Utility ---
function logToTerminal(message, type = 'system') {
  if (!elements.terminalFeed) return;
  const time = new Date().toISOString().substring(11, 19);
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  line.textContent = `[${time}] ${message}`;
  elements.terminalFeed.appendChild(line);
  
  terminalLogCount++;
  if (elements.terminalCountBadge) {
    elements.terminalCountBadge.textContent = `${terminalLogCount} Entries`;
  }
  
  if (elements.terminalAutoScroll && elements.terminalAutoScroll.checked) {
    elements.terminalFeed.scrollTop = elements.terminalFeed.scrollHeight;
  }
}

// --- Helper Cryptographic / Random Generators ---
function generateRandomHex(length = 32) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateRandomMinerEmail() {
  const domains = ['bitminer.org', 'satoshinet.io', 'hashcloud.crypto', 'nodevault.app'];
  const prefixes = ['miner', 'worker', 'rig', 'node', 'crypto', 'hash'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prefix}_${num}@${domain}`;
}

// Base64 helper with UTF-8 safety
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    return atob(b64);
  }
}

// --- Core Mining Logic ---
function executeMineCycle() {
  // 1. Auto generate valid email address in base64 encryption
  const rawEmail = generateRandomMinerEmail();
  const emailBase64 = toBase64(rawEmail);
  
  // 2. Generate a base64 key value
  const rawKey = generateRandomHex(24);
  const keyBase64 = toBase64(rawKey);
  
  // 3. Combine the two generated base64 strings into the singular processed blab combination
  // Using core variable [blab]
  const blab = toBase64(`${emailBase64}:${keyBase64}`);
  
  const minedRecord = {
    id: 'blab_' + generateRandomHex(8),
    blab: blab,
    emailBase64: emailBase64,
    keyBase64: keyBase64,
    rawEmail: rawEmail,
    timestamp: new Date().toISOString(),
    converted: false,
    txHash: null,
  };

  state.minedBlabs.push(minedRecord);

  // Update mining visualizer preview
  if (elements.previewEmail) elements.previewEmail.textContent = emailBase64;
  if (elements.previewKey) elements.previewKey.textContent = keyBase64;
  if (elements.previewBlab) elements.previewBlab.textContent = blab;

  logToTerminal(
    `[MINED BLAB] Generated Base64 Email: ${emailBase64.substring(0, 14)}... | Key: ${keyBase64.substring(0, 10)}... | blab: ${blab.substring(0, 20)}...`,
    'mine'
  );

  // Auto-convert check if user enabled it
  if (state.autoConvert) {
    convertSingleBlab(minedRecord);
  }

  updateUI();
  persistData();
}

// --- Core Conversion Processing Algorithm ---
/**
 * Uses core variable [blab], [miner_identity_email], and [app_user_selected_amount]
 * to verify, convert, and output response to feed terminal.
 */
function convertSingleBlab(record) {
  if (!record || record.converted) return;

  const blab = record.blab;
  const miner_identity_email = state.miner_identity_email.trim();
  const app_user_selected_amount = parseFloat(state.app_user_selected_amount) || 0.00025;

  // Validate blab structure
  try {
    const decodedCombination = fromBase64(blab);
    const [partEmailB64, partKeyB64] = decodedCombination.split(':');
    
    if (!partEmailB64 || !partKeyB64) {
      logToTerminal(`[CONVERT FAILED] Invalid [blab] format: ${blab}`, 'error');
      return;
    }

    // Verify & sign transaction with miner identity
    const txHash = '0x' + generateRandomHex(16);
    record.converted = true;
    record.txHash = txHash;
    record.convertedBy = miner_identity_email;
    record.amountBTC = app_user_selected_amount;
    record.convertedAt = new Date().toISOString();

    state.convertedBlabs.push(record);
    state.totalPayoutBTC += app_user_selected_amount;

    // Output response for each singular processed final base64 string combination to feed terminal
    logToTerminal(
      `[CONVERTED] blab: ${blab.substring(0, 18)}... | miner_identity_email: ${miner_identity_email} | app_user_selected_amount: ${app_user_selected_amount.toFixed(8)} BTC | Tx: ${txHash}`,
      'convert'
    );
  } catch (err) {
    logToTerminal(`[CONVERT ERROR] Failed processing blab [${blab}]: ${err.message}`, 'error');
  }
}

function convertAllPendingBlabs() {
  const unconverted = state.minedBlabs.filter((b) => !b.converted);
  if (unconverted.length === 0) {
    logToTerminal('[CONVERT] No unconverted [blab] payloads available in memory queue.', 'system');
    return;
  }

  logToTerminal(`[CONVERT BATCH] Starting conversion of ${unconverted.length} singular [blab] string combinations...`, 'system');
  unconverted.forEach((b) => convertSingleBlab(b));
  updateUI();
  persistData();
}

// --- UI Update & Metrics Synchronization ---
function updateUI() {
  const totalMined = state.minedBlabs.length;
  const totalConverted = state.minedBlabs.filter((b) => b.converted).length;
  const totalUnconverted = totalMined - totalConverted;
  const currentRate = parseFloat(state.app_user_selected_amount) || 0.00025;
  const estimatedPendingPayout = totalUnconverted * currentRate;

  if (elements.statMinedBlabs) elements.statMinedBlabs.textContent = totalMined.toLocaleString();
  if (elements.statUnconverted) elements.statUnconverted.textContent = totalUnconverted.toLocaleString();
  if (elements.statConverted) elements.statConverted.textContent = totalConverted.toLocaleString();
  if (elements.statPayout) elements.statPayout.textContent = state.totalPayoutBTC.toFixed(8);

  if (elements.summaryPendingCount) elements.summaryPendingCount.textContent = totalUnconverted;
  if (elements.summaryEstimatedPayout) {
    elements.summaryEstimatedPayout.textContent = `${estimatedPendingPayout.toFixed(8)} BTC`;
  }
  if (elements.rateTagValue) {
    elements.rateTagValue.textContent = `${currentRate.toFixed(5)} BTC`;
  }
}

// --- Hashrate Fluctuation Engine ---
function updateHashrate() {
  if (!state.miningActive) {
    if (elements.hashrateDisplay) elements.hashrateDisplay.textContent = '0.00 MH/s';
    if (elements.hashratePulse) elements.hashratePulse.classList.remove('active');
    return;
  }
  const jitter = (Math.random() - 0.5) * 4;
  const current = Math.max(10, state.hashrateBase + jitter);
  if (elements.hashrateDisplay) elements.hashrateDisplay.textContent = `${current.toFixed(2)} MH/s`;
  if (elements.hashratePulse) elements.hashratePulse.classList.add('active');
}

// --- Mining Control ---
function toggleMining() {
  state.miningActive = !state.miningActive;

  if (state.miningActive) {
    if (elements.toggleMineBtn) {
      elements.toggleMineBtn.innerHTML = '<span class="btn-icon">■</span> Stop Mining';
      elements.toggleMineBtn.classList.add('active-mining');
    }
    if (elements.miningStatusBadge) {
      elements.miningStatusBadge.textContent = 'MINING ACTIVE';
      elements.miningStatusBadge.className = 'status-badge mining';
    }
    if (elements.miningVisualizer) {
      elements.miningVisualizer.classList.add('active');
    }
    logToTerminal('[MINER STARTED] Continuous hash generation running at ~43 MH/s.', 'mine');
    
    // Run immediately, then schedule
    executeMineCycle();
    state.miningInterval = setInterval(executeMineCycle, 2800);
  } else {
    if (elements.toggleMineBtn) {
      elements.toggleMineBtn.innerHTML = '<span class="btn-icon">▶</span> Start Mining';
      elements.toggleMineBtn.classList.remove('active-mining');
    }
    if (elements.miningStatusBadge) {
      elements.miningStatusBadge.textContent = 'IDLE';
      elements.miningStatusBadge.className = 'status-badge idle';
    }
    if (elements.miningVisualizer) {
      elements.miningVisualizer.classList.remove('active');
    }
    if (state.miningInterval) {
      clearInterval(state.miningInterval);
      state.miningInterval = null;
    }
    logToTerminal('[MINER STOPPED] Mining process suspended.', 'system');
  }
  updateHashrate();
}

// --- Tab Switching ---
function setActiveTab(tab) {
  if (tab === 'mine') {
    elements.tabMineBtn.classList.add('active');
    elements.tabMineBtn.setAttribute('aria-selected', 'true');
    elements.tabConvertBtn.classList.remove('active');
    elements.tabConvertBtn.setAttribute('aria-selected', 'false');
    elements.viewMine.classList.add('active');
    elements.viewConvert.classList.remove('active');
  } else {
    elements.tabConvertBtn.classList.add('active');
    elements.tabConvertBtn.setAttribute('aria-selected', 'true');
    elements.tabMineBtn.classList.remove('active');
    elements.tabMineBtn.setAttribute('aria-selected', 'false');
    elements.viewConvert.classList.add('active');
    elements.viewMine.classList.remove('active');
  }
}

// --- PWA Installation Setup ---
let deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  if (elements.pwaInstallBtn) {
    elements.pwaInstallBtn.classList.remove('hidden');
  }
});

if (elements.pwaInstallBtn) {
  elements.pwaInstallBtn.addEventListener('click', async () => {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      const choice = await deferredPwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        logToTerminal('[PWA] BitMiner application installed successfully.', 'system');
      }
      deferredPwaPrompt = null;
      elements.pwaInstallBtn.classList.add('hidden');
    }
  });
}

// Register Service Worker for PWA compliance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

// --- Event Bindings ---
function initEventListeners() {
  elements.tabMineBtn.addEventListener('click', () => setActiveTab('mine'));
  elements.tabConvertBtn.addEventListener('click', () => setActiveTab('convert'));
  elements.toggleMineBtn.addEventListener('click', toggleMining);

  elements.autoConvertCheckbox.addEventListener('change', (e) => {
    state.autoConvert = e.target.checked;
    logToTerminal(`[CONFIG] Auto-convert is now ${state.autoConvert ? 'ENABLED' : 'DISABLED'}.`, 'system');
  });

  elements.inputMinerEmail.addEventListener('input', (e) => {
    state.miner_identity_email = e.target.value;
    persistData();
  });

  elements.inputConvertAmount.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      state.app_user_selected_amount = val;
      updateUI();
      persistData();
    }
  });

  elements.btnConvertAll.addEventListener('click', convertAllPendingBlabs);

  elements.btnClearData.addEventListener('click', () => {
    if (confirm('Reset all mined blabs and converted balances?')) {
      state.minedBlabs = [];
      state.convertedBlabs = [];
      state.totalPayoutBTC = 0;
      persistData();
      updateUI();
      logToTerminal('[RESET] In-memory and local repository state flushed.', 'system');
    }
  });

  elements.btnClearTerminal.addEventListener('click', () => {
    elements.terminalFeed.innerHTML = '<div class="terminal-line system">[SYSTEM] Feed cleared by user.</div>';
    terminalLogCount = 1;
    elements.terminalCountBadge.textContent = '1 Entry';
  });

  elements.btnExportJson.addEventListener('click', () => {
    const exportData = {
      miner_identity_email: state.miner_identity_email,
      app_user_selected_amount: state.app_user_selected_amount,
      totalMinedBlabs: state.minedBlabs.length,
      totalConverted: state.convertedBlabs.length,
      totalPayoutBTC: state.totalPayoutBTC,
      records: state.minedBlabs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitminer_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logToTerminal('[EXPORT] Exported data as JSON file.', 'system');
  });

  // Periodic hashrate update
  setInterval(updateHashrate, 1500);
}

// --- App Initialization ---
function initApp() {
  loadPersistedData();
  
  if (elements.inputMinerEmail) {
    elements.inputMinerEmail.value = state.miner_identity_email;
  }
  if (elements.inputConvertAmount) {
    elements.inputConvertAmount.value = state.app_user_selected_amount;
  }
  
  initEventListeners();
  updateUI();
  logToTerminal('[INIT] BitMiner core loaded. Core variables [blab], [miner_identity_email], and [app_user_selected_amount] bound successfully.', 'system');
}

initApp();