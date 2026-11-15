/**
 * BitMiner - Core Engine & Processing Algorithm
 * 
 * Requirements addressed:
 * - Two menu options: 'Mine' and 'Convert'
 * - Auto generates valid email address in base64 encryption, generates base64 key value,
 *   and synthesizes into final base64 [blab] combination
 * - Conversion processing algorithm using core variables:
 *     [blab], [miner_identity_email], [app_user_selected_amount]
 * - Real-time automatic feed terminal output for each singular processed blab
 * - Auto-convert functionality & PWA support
 */

// --- State Management ---
const state = {
  activeTab: 'mine',
  isMining: false,
  mineTimer: null,
  hashrateTimer: null,
  mineIntervalMs: 1000,
  autoConvert: false,
  totalConvertedBtc: 0.0,
  currentHashrate: 0.0,
  minedLedger: [], // list of { id, blab, email, base64_email, base64_key, timestamp, converted, convertedAt, convertedAmount, txHash }
};

// --- DOM Element References ---
const tabBtnMine = document.getElementById('tab-btn-mine');
const tabBtnConvert = document.getElementById('tab-btn-convert');
const viewMine = document.getElementById('mine-view');
const viewConvert = document.getElementById('convert-view');

const statMinedBlabs = document.getElementById('stat-mined-blabs');
const statPendingBlabs = document.getElementById('stat-pending-blabs');
const statConvertedBalance = document.getElementById('stat-converted-balance');
const statHashrate = document.getElementById('stat-hashrate');

const btnToggleMine = document.getElementById('btn-toggle-mine');
const mineBtnIcon = document.getElementById('mine-btn-icon');
const mineBtnText = document.getElementById('mine-btn-text');
const btnMineSingular = document.getElementById('btn-mine-singular');
const selectMineInterval = document.getElementById('mine-interval');
const miningStatusTag = document.getElementById('mining-status-tag');

const dispRawEmail = document.getElementById('disp-raw-email');
const dispB64Email = document.getElementById('disp-b64-email');
const dispB64Key = document.getElementById('disp-b64-key');
const dispBlab = document.getElementById('disp-blab');

const inputMinerIdentityEmail = document.getElementById('miner-identity-email-input');
const inputAppUserSelectedAmount = document.getElementById('app-user-selected-amount-input');
const btnConvertNext = document.getElementById('btn-convert-next');
const btnConvertAll = document.getElementById('btn-convert-all');
const toggleAutoConvert = document.getElementById('auto-convert-toggle');

const btnExportJson = document.getElementById('btn-export-json');
const btnClearLedger = document.getElementById('btn-clear-ledger');
const ledgerCountUnprocessed = document.getElementById('ledger-count-unprocessed');
const ledgerCountProcessed = document.getElementById('ledger-count-processed');
const ledgerCountTotal = document.getElementById('ledger-count-total');

const feedTerminal = document.getElementById('feed-terminal');
const btnClearTerminal = document.getElementById('btn-clear-terminal');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

// --- Utility: Terminal Logging ---
function logTerminal(message, type = 'system') {
  if (!feedTerminal) return;
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.className = 'term-line';
  
  let typeClass = 'term-type-system';
  let prefix = '[SYSTEM]';
  if (type === 'mine') {
    typeClass = 'term-type-mine';
    prefix = '[MINE]';
  } else if (type === 'convert') {
    typeClass = 'term-type-convert';
    prefix = '[CONVERT]';
  } else if (type === 'error') {
    typeClass = 'term-type-error';
    prefix = '[ERROR]';
  }

  line.innerHTML = `<span class="term-time">${time}</span> <span class="${typeClass}">${prefix}</span> <span>${message}</span>`;
  feedTerminal.appendChild(line);
  feedTerminal.scrollTop = feedTerminal.scrollHeight;
}

// --- Tab Switching ---
function switchTab(targetTab) {
  state.activeTab = targetTab;
  if (targetTab === 'mine') {
    tabBtnMine.classList.add('active');
    tabBtnConvert.classList.remove('active');
    viewMine.classList.add('active');
    viewConvert.classList.remove('active');
  } else {
    tabBtnConvert.classList.add('active');
    tabBtnMine.classList.remove('active');
    viewConvert.classList.add('active');
    viewMine.classList.remove('active');
  }
}

tabBtnMine.addEventListener('click', () => switchTab('mine'));
tabBtnConvert.addEventListener('click', () => switchTab('convert'));

// --- Helper: Random Generator for Realistic Mined Identities ---
function generateMinedIdentityEmail() {
  const prefixes = ['miner', 'node', 'rig', 'core', 'crypto', 'hash', 'nexus', 'stratum'];
  const domains = ['bitnet.io', 'blockmesh.org', 'stratumpool.net', 'cryptomine.tech', 'bitminer.cloud'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prefix}_${hex}@${domain}`;
}

function generateCryptoKeyHex(length = 32) {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// --- Core Mining Routine ---
// Generates encrypted email, generates base64 key, and synthesizes them into [blab]
function executeMiningCycle() {
  const rawEmail = generateMinedIdentityEmail();
  const base64_email = btoa(rawEmail);
  
  const rawKey = generateCryptoKeyHex(16);
  const base64_key = btoa(rawKey);
  
  // Synthesize singular base64 blab combination
  const blab = btoa(`${base64_email}::${base64_key}`);
  
  const ledgerItem = {
    id: 'blab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    blab,
    email: rawEmail,
    base64_email,
    base64_key,
    timestamp: new Date().toISOString(),
    converted: false,
    convertedAt: null,
    convertedAmount: 0,
    txHash: null,
  };

  state.minedLedger.unshift(ledgerItem);

  // Update UI Displays
  dispRawEmail.textContent = rawEmail;
  dispB64Email.textContent = base64_email;
  dispB64Key.textContent = base64_key;
  dispBlab.textContent = blab;

  logTerminal(
    `Mined block: <span class="term-code">${blab.substring(0, 24)}...</span> (Identity: ${rawEmail})`,
    'mine'
  );

  updateLedgerMetrics();

  // Auto-convert if enabled
  if (state.autoConvert) {
    convertSingularBlab(ledgerItem.id);
  }
}

// --- Core Conversion Processing Algorithm ---
/**
 * Executes conversion algorithm for mined data.
 * Ensures that core variables [blab], [miner_identity_email] and [app_user_selected_amount]
 * are used in the correct places in the processing algorithm.
 */
function processBlabConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || typeof blab !== 'string') {
    throw new Error('Invalid or missing [blab] string for conversion');
  }
  if (!miner_identity_email || !miner_identity_email.includes('@')) {
    throw new Error('Invalid [miner_identity_email] identity provided');
  }
  
  const numericAmount = parseFloat(app_user_selected_amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid [app_user_selected_amount] specified');
  }

  // Decrypt and validate components of the singular blab
  let decodedRaw;
  try {
    decodedRaw = atob(blab);
  } catch (err) {
    throw new Error('Failed to decode base64 blab payload');
  }

  const [encodedEmail, encodedKey] = decodedRaw.split('::');
  const originEmail = encodedEmail ? atob(encodedEmail) : 'unknown';

  // Generate deterministic transaction hash for proof of conversion
  const hashSeed = `${blab}-${miner_identity_email}-${numericAmount}-${Date.now()}`;
  const txHash = '0x' + Array.from(new TextEncoder().encode(hashSeed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32);

  return {
    blab,
    miner_identity_email,
    app_user_selected_amount: numericAmount,
    originEmail,
    txHash,
    status: 'CONVERTED',
    processedAt: new Date().toISOString(),
  };
}

// --- Singular Conversion Workflow ---
function convertSingularBlab(blabId = null) {
  // Acquire and validate user inputs
  const miner_identity_email = inputMinerIdentityEmail.value.trim();
  const app_user_selected_amount = parseFloat(inputAppUserSelectedAmount.value);

  if (!miner_identity_email) {
    logTerminal('Conversion halted: [miner_identity_email] input is required.', 'error');
    return false;
  }
  if (isNaN(app_user_selected_amount) || app_user_selected_amount <= 0) {
    logTerminal('Conversion halted: [app_user_selected_amount] must be greater than 0.', 'error');
    return false;
  }

  // Find the target blab
  let targetItem = null;
  if (blabId) {
    targetItem = state.minedLedger.find(item => item.id === blabId && !item.converted);
  } else {
    // Pick earliest unconverted blab (FIFO)
    targetItem = state.minedLedger.slice().reverse().find(item => !item.converted);
  }

  if (!targetItem) {
    logTerminal('No unconverted [blab] available in ledger. Mine more blabs first.', 'system');
    return false;
  }

  // Extract core variable [blab]
  const blab = targetItem.blab;

  try {
    // Execute the processing algorithm with [blab], [miner_identity_email], [app_user_selected_amount]
    const result = processBlabConversion(blab, miner_identity_email, app_user_selected_amount);
    
    // Mark item in ledger
    targetItem.converted = true;
    targetItem.convertedAt = result.processedAt;
    targetItem.convertedAmount = result.app_user_selected_amount;
    targetItem.txHash = result.txHash;
    targetItem.targetEmail = result.miner_identity_email;

    state.totalConvertedBtc += result.app_user_selected_amount;

    // Feed terminal automatic output response for each singular processed blab
    logTerminal(
      `Output Response: Converted [blab] <span class="term-code">${blab.substring(0, 18)}...</span> ` +
      `for miner <strong>${miner_identity_email}</strong> | Credited: <strong>+${result.app_user_selected_amount.toFixed(6)} BTC</strong> ` +
      `| Tx: <span class="term-code">${result.txHash}</span>`,
      'convert'
    );

    updateLedgerMetrics();
    return true;
  } catch (err) {
    logTerminal(`Error processing conversion for [blab]: ${err.message}`, 'error');
    return false;
  }
}

// --- Batch Conversion Workflow ---
function convertAllPendingBlabs() {
  const pending = state.minedLedger.filter(item => !item.converted);
  if (pending.length === 0) {
    logTerminal('Batch Conversion: 0 pending blabs to convert.', 'system');
    return;
  }
  logTerminal(`Batch Conversion started: processing ${pending.length} pending blabs...`, 'system');
  let count = 0;
  for (const item of pending) {
    const success = convertSingularBlab(item.id);
    if (success) count++;
  }
  logTerminal(`Batch Conversion complete: ${count} [blab] units converted successfully.`, 'convert');
}

// --- Metrics & UI Updates ---
function updateLedgerMetrics() {
  const total = state.minedLedger.length;
  const processed = state.minedLedger.filter(i => i.converted).length;
  const pending = total - processed;

  statMinedBlabs.textContent = total.toLocaleString();
  statPendingBlabs.textContent = pending.toLocaleString();
  statConvertedBalance.textContent = state.totalConvertedBtc.toFixed(6) + ' BTC';

  ledgerCountTotal.textContent = total;
  ledgerCountProcessed.textContent = processed;
  ledgerCountUnprocessed.textContent = pending;
}

// --- Mining Control (Start/Stop) ---
function startMining() {
  if (state.isMining) return;
  state.isMining = true;
  mineBtnIcon.textContent = '⏸';
  mineBtnText.textContent = 'Pause Mining';
  btnToggleMine.classList.add('mining-active');
  miningStatusTag.textContent = 'ACTIVE MINING';
  miningStatusTag.className = 'tag-active';

  logTerminal(`Mining engine engaged. Synthesis frequency: ${state.mineIntervalMs}ms`, 'system');

  // Initial single trigger
  executeMiningCycle();

  state.mineTimer = setInterval(() => {
    executeMiningCycle();
  }, state.mineIntervalMs);

  // Hashrate simulator
  state.hashrateTimer = setInterval(() => {
    const variance = (Math.random() * 4.5) - 2.0;
    state.currentHashrate = Math.max(12.4, +(42.5 + variance).toFixed(2));
    statHashrate.textContent = `${state.currentHashrate} MH/s`;
  }, 800);
}

function stopMining() {
  if (!state.isMining) return;
  state.isMining = false;
  mineBtnIcon.textContent = '▶';
  mineBtnText.textContent = 'Start Mining';
  btnToggleMine.classList.remove('mining-active');
  miningStatusTag.textContent = 'STANDBY';
  miningStatusTag.className = 'tag-idle';

  if (state.mineTimer) clearInterval(state.mineTimer);
  if (state.hashrateTimer) clearInterval(state.hashrateTimer);
  statHashrate.textContent = '0.00 MH/s';

  logTerminal('Mining engine paused.', 'system');
}

btnToggleMine.addEventListener('click', () => {
  if (state.isMining) {
    stopMining();
  } else {
    startMining();
  }
});

btnMineSingular.addEventListener('click', () => {
  executeMiningCycle();
});

selectMineInterval.addEventListener('change', (e) => {
  state.mineIntervalMs = parseInt(e.target.value, 10) || 1000;
  if (state.isMining) {
    clearInterval(state.mineTimer);
    state.mineTimer = setInterval(executeMiningCycle, state.mineIntervalMs);
    logTerminal(`Mining frequency updated to ${state.mineIntervalMs}ms`, 'system');
  }
});

// --- Convert UI Handlers ---
btnConvertNext.addEventListener('click', () => {
  convertSingularBlab();
});

btnConvertAll.addEventListener('click', () => {
  convertAllPendingBlabs();
});

toggleAutoConvert.addEventListener('change', (e) => {
  state.autoConvert = e.target.checked;
  logTerminal(`Auto-Convert mode: ${state.autoConvert ? 'ENABLED' : 'DISABLED'}`, 'system');
  if (state.autoConvert) {
    convertAllPendingBlabs();
  }
});

// --- JSON Ledger Export & Clear ---
btnExportJson.addEventListener('click', () => {
  const payload = JSON.stringify(state.minedLedger, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitminer_ledger_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  logTerminal('Exported full mined ledger JSON file.', 'system');
});

btnClearLedger.addEventListener('click', () => {
  if (confirm('Clear all stored blabs from the ledger?')) {
    state.minedLedger = [];
    updateLedgerMetrics();
    dispRawEmail.textContent = 'awaiting trigger...';
    dispB64Email.textContent = 'awaiting trigger...';
    dispB64Key.textContent = 'awaiting trigger...';
    dispBlab.textContent = 'awaiting trigger...';
    logTerminal('Ledger database cleared.', 'system');
  }
});

btnClearTerminal.addEventListener('click', () => {
  feedTerminal.innerHTML = '';
  logTerminal('Feed terminal cleared.', 'system');
});

// --- PWA Installation Functionality ---
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.remove('hidden');
  }
});

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      logTerminal(`PWA Install outcome: ${outcome}`, 'system');
      deferredInstallPrompt = null;
      pwaInstallBtn.classList.add('hidden');
    }
  });
}

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  logTerminal('BitMiner Terminal v1.0.0 initialized.', 'system');
  logTerminal('Ready for mining & blab conversion processing.', 'system');
  updateLedgerMetrics();
});
