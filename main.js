import { processBlabConversion } from './src/converter.js';

// Application State
const state = {
  activeTab: 'mine',
  isMining: false,
  miningIntervalId: null,
  miningSpeedMs: 1400,
  autoConvert: false,
  minedBlabs: [],          // Pool of mined objects { rawEmail, emailB64, keyB64, blab, timestamp }
  convertedRecords: [],    // Processed conversion outcomes
  minerIdentityEmail: 'satoshi.node@bitmesh.org',
  appUserSelectedAmount: '0.0025',
  totalCreditedBTC: 0
};

// DOM Elements
const elements = {
  tabMineBtn: document.getElementById('tab-mine-btn'),
  tabConvertBtn: document.getElementById('tab-convert-btn'),
  viewMine: document.getElementById('view-mine'),
  viewConvert: document.getElementById('view-convert'),
  
  // Mining Controls
  toggleMiningBtn: document.getElementById('toggle-mining-btn'),
  miningBtnText: document.getElementById('mining-btn-text'),
  mineSingleBtn: document.getElementById('mine-single-btn'),
  miningIntervalSelect: document.getElementById('mining-interval-select'),
  miningStateIndicator: document.getElementById('mining-state-indicator'),
  
  // Mining Stats & Previews
  statHashrate: document.getElementById('stat-hashrate'),
  statMinedCount: document.getElementById('stat-mined-count'),
  statPendingCount: document.getElementById('stat-pending-count'),
  latestRawEmail: document.getElementById('latest-raw-email'),
  latestEmailB64: document.getElementById('latest-email-b64'),
  latestKeyB64: document.getElementById('latest-key-b64'),
  latestBlab: document.getElementById('latest-blab'),
  
  // Conversion Controls
  inputMinerEmail: document.getElementById('input-miner-email'),
  btnUseDefaultEmail: document.getElementById('btn-use-default-email'),
  inputSelectedAmount: document.getElementById('input-selected-amount'),
  amountChips: document.querySelectorAll('.btn-chip'),
  toggleAutoConvert: document.getElementById('toggle-auto-convert'),
  btnConvertAll: document.getElementById('btn-convert-all'),
  btnPendingCount: document.getElementById('btn-pending-count'),
  btnExportJson: document.getElementById('btn-export-json'),
  statConvertedCount: document.getElementById('stat-converted-count'),
  statCreditedBalance: document.getElementById('stat-credited-balance'),
  
  // Feed Terminal
  terminalFeed: document.getElementById('terminal-feed'),
  terminalClearBtn: document.getElementById('terminal-clear-btn'),
  feedCountBadge: document.getElementById('feed-count-badge'),
  
  // PWA Install
  pwaInstallBtn: document.getElementById('pwa-install-btn')
};

let terminalEventCount = 2;

// Helper to log to the Feed Terminal
function logToTerminal(type, message) {
  terminalEventCount++;
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  
  const now = new Date();
  const timeStr = `[${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}]`;
  
  line.innerHTML = `<span class="term-time">${timeStr}</span> <span class="term-msg">${escapeHtml(message)}</span>`;
  elements.terminalFeed.appendChild(line);
  elements.terminalFeed.scrollTop = elements.terminalFeed.scrollHeight;
  elements.feedCountBadge.textContent = `${terminalEventCount} events`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Mining Generator Function
// As described: Auto generates valid email address in base64 encryption.
// Once valid encrypted email is created, generates base64 key value, then combines into [blab].
function executeMiningCycle() {
  const domains = ['bitmesh.org', 'nodehash.io', 'ledgercore.tech', 'cryptomine.net', 'bitminer.cloud'];
  const prefixes = ['miner_node', 'satoshi_core', 'hash_worker', 'block_hunter', 'quantum_rig', 'peer_validator'];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  
  const rawEmail = `${randomPrefix}_${randomNum}@${randomDomain}`;
  
  // 1. Base64 encryption of valid email address
  const emailB64 = btoa(rawEmail);
  
  // 2. Base64 key value generation (16-byte random key encoded to base64)
  const keyBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  const rawKeyHex = keyBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  const keyB64 = btoa(rawKeyHex);
  
  // 3. Combined generated base64 strings: [blab]
  const blab = `${emailB64}.${keyB64}`;
  
  const record = {
    rawEmail,
    emailB64,
    keyB64,
    blab,
    timestamp: new Date().toISOString(),
    converted: false
  };
  
  state.minedBlabs.push(record);
  
  // Update UI previews
  elements.latestRawEmail.textContent = rawEmail;
  elements.latestEmailB64.textContent = emailB64;
  elements.latestKeyB64.textContent = keyB64;
  elements.latestBlab.textContent = blab;
  
  logToTerminal('mined', `[MINED] Email: ${rawEmail} -> b64Email: ${emailB64} | b64Key: ${keyB64.substring(0, 10)}... -> [blab] generated`);
  
  updateStats();
  
  // Automatic conversion if auto-convert toggle is enabled
  if (state.autoConvert) {
    executeSingleBlabConversion(record);
  }
}

// Conversion Execution
function executeSingleBlabConversion(blabRecord) {
  if (blabRecord.converted) return;
  
  const blab = blabRecord.blab;
  const miner_identity_email = elements.inputMinerEmail.value.trim() || state.minerIdentityEmail;
  const app_user_selected_amount = elements.inputSelectedAmount.value.trim() || state.appUserSelectedAmount;
  
  try {
    // Execute conversion algorithm using [blab], [miner_identity_email], and [app_user_selected_amount]
    const result = processBlabConversion(blab, miner_identity_email, app_user_selected_amount);
    
    blabRecord.converted = true;
    state.convertedRecords.push(result);
    state.totalCreditedBTC += parseFloat(result.netCredit);
    
    // Feed terminal output response for singular processed blab combination
    logToTerminal('convert', result.terminalOutputResponse);
    
    updateStats();
  } catch (error) {
    logToTerminal('error', `[CONVERT ERROR] ${error.message}`);
  }
}

function executeAllPendingConversions() {
  const pending = state.minedBlabs.filter(b => !b.converted);
  if (pending.length === 0) {
    logToTerminal('prompt', '[CONVERT] No pending blab records in memory to convert. Mine some blabs first!');
    return;
  }
  
  logToTerminal('prompt', `[BATCH] Beginning conversion processing for ${pending.length} singular [blab] records...`);
  
  pending.forEach(item => {
    executeSingleBlabConversion(item);
  });
}

// Update Counter Stats
function updateStats() {
  const totalMined = state.minedBlabs.length;
  const pendingCount = state.minedBlabs.filter(b => !b.converted).length;
  const convertedCount = state.convertedRecords.length;
  
  elements.statMinedCount.textContent = totalMined;
  elements.statPendingCount.textContent = pendingCount;
  elements.btnPendingCount.textContent = pendingCount;
  elements.statConvertedCount.textContent = `${convertedCount} blabs`;
  elements.statCreditedBalance.textContent = `${state.totalCreditedBTC.toFixed(6)} BTC`;
  
  if (state.isMining) {
    const randomHashrate = (14.2 + Math.random() * 2.8).toFixed(2);
    elements.statHashrate.textContent = `${randomHashrate} MH/s`;
  } else {
    elements.statHashrate.textContent = '0.00 MH/s';
  }
}

// Tab Switching Logic
function switchTab(tabName) {
  state.activeTab = tabName;
  if (tabName === 'mine') {
    elements.tabMineBtn.classList.add('active');
    elements.tabConvertBtn.classList.remove('active');
    elements.viewMine.classList.add('active');
    elements.viewConvert.classList.remove('active');
  } else {
    elements.tabConvertBtn.classList.add('active');
    elements.tabMineBtn.classList.remove('active');
    elements.viewConvert.classList.add('active');
    elements.viewMine.classList.remove('active');
  }
}

// Event Listeners
elements.tabMineBtn.addEventListener('click', () => switchTab('mine'));
elements.tabConvertBtn.addEventListener('click', () => switchTab('convert'));

elements.toggleMiningBtn.addEventListener('click', () => {
  if (state.isMining) {
    // Stop mining
    clearInterval(state.miningIntervalId);
    state.miningIntervalId = null;
    state.isMining = false;
    elements.miningBtnText.textContent = 'Start Mining';
    elements.toggleMiningBtn.classList.remove('btn-secondary');
    elements.toggleMiningBtn.classList.add('btn-primary');
    elements.miningStateIndicator.textContent = 'Idle';
    elements.miningStateIndicator.classList.remove('active');
    logToTerminal('system', '[MINER] Mining worker halted by operator.');
    updateStats();
  } else {
    // Start mining
    state.isMining = true;
    elements.miningBtnText.textContent = 'Stop Mining';
    elements.toggleMiningBtn.classList.remove('btn-primary');
    elements.toggleMiningBtn.classList.add('btn-secondary');
    elements.miningStateIndicator.textContent = 'Mining Active';
    elements.miningStateIndicator.classList.add('active');
    logToTerminal('system', `[MINER] Mining worker started at ${state.miningSpeedMs}ms intervals.`);
    
    // Initial run
    executeMiningCycle();
    state.miningIntervalId = setInterval(executeMiningCycle, state.miningSpeedMs);
  }
});

elements.mineSingleBtn.addEventListener('click', () => {
  executeMiningCycle();
});

elements.miningIntervalSelect.addEventListener('change', (e) => {
  state.miningSpeedMs = parseInt(e.target.value, 10);
  if (state.isMining) {
    clearInterval(state.miningIntervalId);
    state.miningIntervalId = setInterval(executeMiningCycle, state.miningSpeedMs);
    logToTerminal('system', `[MINER] Hash generator rate updated to ${state.miningSpeedMs}ms`);
  }
});

elements.btnUseDefaultEmail.addEventListener('click', () => {
  elements.inputMinerEmail.value = state.minerIdentityEmail;
});

elements.amountChips.forEach(chip => {
  chip.addEventListener('click', () => {
    elements.amountChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    elements.inputSelectedAmount.value = chip.dataset.amt;
    state.appUserSelectedAmount = chip.dataset.amt;
  });
});

elements.inputSelectedAmount.addEventListener('input', (e) => {
  state.appUserSelectedAmount = e.target.value;
});

elements.toggleAutoConvert.addEventListener('change', (e) => {
  state.autoConvert = e.target.checked;
  if (state.autoConvert) {
    logToTerminal('auto-convert', '[AUTO-CONVERT] Real-time conversion enabled. All incoming mined [blab] combinations will automatically convert upon arrival.');
    // Convert existing pending items immediately
    executeAllPendingConversions();
  } else {
    logToTerminal('system', '[AUTO-CONVERT] Real-time conversion disabled. Blabs will pool in pending storage.');
  }
});

elements.btnConvertAll.addEventListener('click', () => {
  executeAllPendingConversions();
});

elements.btnExportJson.addEventListener('click', () => {
  const payload = {
    bitminer_version: '1.2.0',
    exported_at: new Date().toISOString(),
    miner_identity_email: elements.inputMinerEmail.value || state.minerIdentityEmail,
    app_user_selected_amount: elements.inputSelectedAmount.value || state.appUserSelectedAmount,
    mined_blabs_pool: state.minedBlabs,
    conversion_ledger: state.convertedRecords
  };
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitminer_data_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  logToTerminal('system', `[EXPORT] Downloaded ${state.minedBlabs.length} blab records as JSON.`);
});

elements.terminalClearBtn.addEventListener('click', () => {
  elements.terminalFeed.innerHTML = '';
  terminalEventCount = 0;
  elements.feedCountBadge.textContent = '0 events';
  logToTerminal('system', 'Terminal buffer cleared.');
});

// PWA Functionality
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  elements.pwaInstallBtn.classList.remove('hidden');
});

elements.pwaInstallBtn.addEventListener('click', async () => {
  if (!deferredPrompt) {
    alert('BitMiner is already running as an installed PWA or is ready in your browser.');
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    elements.pwaInstallBtn.classList.add('hidden');
  }
  deferredPrompt = null;
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA service worker registration skipped:', err);
    });
  });
}

// Initialize form defaults
elements.inputMinerEmail.value = state.minerIdentityEmail;
elements.inputSelectedAmount.value = state.appUserSelectedAmount;
updateStats();

console.log('BitMiner application initialized with core variables [blab], [miner_identity_email], [app_user_selected_amount]');
