import './style.css';
import {
  generateMinedBlab,
  processBlabConversion,
  convertPendingBlabs,
  getMinedRecords,
  getConvertedRecords,
  clearAllStorage
} from './src/miner.js';
import { setupPWA } from './src/pwa.js';

// State Management
let isMining = false;
let miningInterval = null;
let hashrateInterval = null;
let currentHashrate = 0;

// DOM Elements - Navigation
const tabMine = document.getElementById('tab-mine');
const tabConvert = document.getElementById('tab-convert');
const viewMine = document.getElementById('view-mine');
const viewConvert = document.getElementById('view-convert');

// DOM Elements - Mining
const btnToggleMine = document.getElementById('btn-toggle-mine');
const mineBtnIcon = document.getElementById('mine-btn-icon');
const mineBtnText = document.getElementById('mine-btn-text');
const btnMineSingle = document.getElementById('btn-mine-single');
const btnClearMined = document.getElementById('btn-clear-mined');
const miningStatusBadge = document.getElementById('mining-status-badge');
const telemetryHashrate = document.getElementById('telemetry-hashrate');
const telemetryTotalBlabs = document.getElementById('telemetry-total-blabs');
const telemetryNonce = document.getElementById('telemetry-nonce');

const pipeEmailRaw = document.getElementById('pipe-email-raw');
const pipeEmailB64 = document.getElementById('pipe-email-b64');
const pipeKeyB64 = document.getElementById('pipe-key-b64');
const pipeBlabFinal = document.getElementById('pipe-blab-final');

const terminalMine = document.getElementById('terminal-mine');
const btnClearMineTerm = document.getElementById('btn-clear-mine-term');
const btnExportMineJson = document.getElementById('btn-export-mine-json');

// DOM Elements - Conversion
const minerIdentityEmailInput = document.getElementById('miner-identity-email');
const appUserSelectedAmountInput = document.getElementById('app-user-selected-amount');
const toggleAutoConvert = document.getElementById('toggle-auto-convert');
const btnProcessConvert = document.getElementById('btn-process-convert');
const btnConvertNext = document.getElementById('btn-convert-next');
const btnClearConvTerm = document.getElementById('btn-clear-conv-term');
const btnExportConvJson = document.getElementById('btn-export-conv-json');
const quickAmountButtons = document.querySelectorAll('.btn-pill');

const terminalConvert = document.getElementById('terminal-convert');
const badgeMinedCount = document.getElementById('badge-mined-count');
const badgePendingCount = document.getElementById('badge-pending-count');
const headerBalance = document.getElementById('header-balance');

const statBlabsMined = document.getElementById('stat-blabs-mined');
const statBlabsPending = document.getElementById('stat-blabs-pending');
const statBlabsConverted = document.getElementById('stat-blabs-converted');
const statTotalUsd = document.getElementById('stat-total-usd');

/**
 * Logs formatted message to a terminal container
 */
function logToTerminal(terminalEl, tag, tagType, message) {
  if (!terminalEl) return;
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.className = `terminal-line tag-${tagType}`;
  line.innerHTML = `
    <span class="t-time">[${time}]</span>
    <span class="t-tag">${tag}</span>
    <span class="t-msg">${message}</span>
  `;
  terminalEl.appendChild(line);
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

/**
 * Updates dashboard counters and telemetry metrics
 */
function refreshStats() {
  const mined = getMinedRecords();
  const converted = getConvertedRecords();
  const pending = mined.filter((m) => m.status === 'PENDING');

  const totalConvertedValue = converted.reduce((sum, item) => sum + (item.usdValue || 0), 0);
  const formattedValue = `$${totalConvertedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (telemetryTotalBlabs) telemetryTotalBlabs.textContent = mined.length;
  if (badgeMinedCount) badgeMinedCount.textContent = mined.length;
  if (badgePendingCount) badgePendingCount.textContent = pending.length;
  if (headerBalance) headerBalance.textContent = formattedValue;

  if (statBlabsMined) statBlabsMined.textContent = mined.length;
  if (statBlabsPending) statBlabsPending.textContent = pending.length;
  if (statBlabsConverted) statBlabsConverted.textContent = converted.length;
  if (statTotalUsd) statTotalUsd.textContent = formattedValue;
}

/**
 * Executes single mining operation and optional auto-conversion
 */
function performMineCycle() {
  const minedRecord = generateMinedBlab();

  // Update Live Pipeline preview
  if (pipeEmailRaw) pipeEmailRaw.textContent = minedRecord.rawEmail;
  if (pipeEmailB64) pipeEmailB64.textContent = minedRecord.base64Email;
  if (pipeKeyB64) pipeKeyB64.textContent = minedRecord.base64Key;
  if (pipeBlabFinal) pipeBlabFinal.textContent = minedRecord.blab;

  // Randomize nonce telemetry
  const randomNonce = '0x' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  if (telemetryNonce) telemetryNonce.textContent = randomNonce;

  // Output into Mining Feed Terminal
  logToTerminal(terminalMine, '[EMAIL_ENCRYPTED]', 'info', `Identity: ${minedRecord.rawEmail} ➔ b64: ${minedRecord.base64Email.substring(0, 18)}...`);
  logToTerminal(terminalMine, '[KEY_GENERATED]', 'mine', `Secret Entropy: ${minedRecord.base64Key.substring(0, 20)}...`);
  logToTerminal(terminalMine, '[BLAB_SYNTHESIZED]', 'blab', `Mined [blab]: ${minedRecord.blab.substring(0, 28)}...`);

  refreshStats();

  // Auto-convert if enabled
  if (toggleAutoConvert && toggleAutoConvert.checked) {
    triggerAutoConvert(minedRecord.blab);
  }
}

/**
 * Automatically converts single mined blab using current parameters
 */
function triggerAutoConvert(blab) {
  const miner_identity_email = minerIdentityEmailInput.value.trim() || 'miner.protocol@bitminer.org';
  const app_user_selected_amount = appUserSelectedAmountInput.value || '25.00';

  try {
    const result = processBlabConversion(blab, miner_identity_email, app_user_selected_amount);
    
    // Output automatic response to conversion feed terminal
    logToTerminal(
      terminalConvert,
      '[AUTO_CONVERT]',
      'convert',
      `Processed blab: ${blab.substring(0, 16)}... | To: ${miner_identity_email} | Amount: $${Number(app_user_selected_amount).toFixed(2)} | Hash: ${result.verificationHash}`
    );
    refreshStats();
  } catch (err) {
    logToTerminal(terminalConvert, '[CONVERT_ERR]', 'warn', err.message);
  }
}

/**
 * Starts continuous mining loop
 */
function startMining() {
  if (isMining) return;
  isMining = true;
  miningStatusBadge.textContent = 'MINING';
  miningStatusBadge.className = 'badge badge-mining';
  mineBtnText.textContent = 'Stop Mining';
  mineBtnIcon.textContent = '⏹';

  currentHashrate = (120 + Math.random() * 40).toFixed(2);
  telemetryHashrate.textContent = `${currentHashrate} MH/s`;

  logToTerminal(terminalMine, '[MINER_STARTED]', 'info', 'Stratum crypto worker started on Base64 blab protocol.');

  performMineCycle();
  miningInterval = setInterval(() => {
    performMineCycle();
  }, 2200);

  hashrateInterval = setInterval(() => {
    currentHashrate = (120 + (Math.random() * 50 - 25)).toFixed(2);
    telemetryHashrate.textContent = `${currentHashrate} MH/s`;
  }, 1000);
}

/**
 * Stops continuous mining loop
 */
function stopMining() {
  if (!isMining) return;
  isMining = false;
  clearInterval(miningInterval);
  clearInterval(hashrateInterval);
  miningInterval = null;
  hashrateInterval = null;

  miningStatusBadge.textContent = 'IDLE';
  miningStatusBadge.className = 'badge badge-idle';
  mineBtnText.textContent = 'Start Mining';
  mineBtnIcon.textContent = '▶';
  telemetryHashrate.textContent = '0.00 MH/s';

  logToTerminal(terminalMine, '[MINER_STOPPED]', 'warn', 'Worker paused by operator.');
}

// Event Listeners - Navigation Tabs
tabMine.addEventListener('click', () => {
  tabMine.classList.add('active');
  tabMine.setAttribute('aria-selected', 'true');
  tabConvert.classList.remove('active');
  tabConvert.setAttribute('aria-selected', 'false');
  viewMine.classList.add('active');
  viewConvert.classList.remove('active');
});

tabConvert.addEventListener('click', () => {
  tabConvert.classList.add('active');
  tabConvert.setAttribute('aria-selected', 'true');
  tabMine.classList.remove('active');
  tabMine.setAttribute('aria-selected', 'false');
  viewConvert.classList.add('active');
  viewMine.classList.remove('active');
});

// Event Listeners - Mining Controls
btnToggleMine.addEventListener('click', () => {
  if (isMining) {
    stopMining();
  } else {
    startMining();
  }
});

btnMineSingle.addEventListener('click', () => {
  performMineCycle();
});

btnClearMined.addEventListener('click', () => {
  if (confirm('Clear all mined and converted blabs from local cache?')) {
    clearAllStorage();
    refreshStats();
    logToTerminal(terminalMine, '[STORAGE_RESET]', 'warn', 'Storage wiped successfully.');
    logToTerminal(terminalConvert, '[STORAGE_RESET]', 'warn', 'Storage wiped successfully.');
  }
});

btnClearMineTerm.addEventListener('click', () => {
  terminalMine.innerHTML = '';
});

btnExportMineJson.addEventListener('click', () => {
  const data = getMinedRecords();
  downloadJSON(data, 'bitminer_mined_records.json');
});

// Event Listeners - Conversion Controls
quickAmountButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    quickAmountButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    appUserSelectedAmountInput.value = btn.dataset.amount;
  });
});

btnProcessConvert.addEventListener('click', () => {
  const miner_identity_email = minerIdentityEmailInput.value.trim();
  const app_user_selected_amount = appUserSelectedAmountInput.value;

  if (!miner_identity_email) {
    alert('Please enter a destination Miner Identity Email.');
    return;
  }

  const results = convertPendingBlabs(miner_identity_email, app_user_selected_amount);
  if (results.length === 0) {
    logToTerminal(terminalConvert, '[INFO]', 'info', 'No pending blabs in queue to convert. Mine more blabs first!');
  } else {
    results.forEach((res) => {
      logToTerminal(
        terminalConvert,
        '[BATCH_CONVERT]',
        'convert',
        `Blab: ${res.blab.substring(0, 16)}... | Assigned: ${res.miner_identity_email} | Amount: $${res.usdValue.toFixed(2)} | Hash: ${res.verificationHash}`
      );
    });
    refreshStats();
  }
});

btnConvertNext.addEventListener('click', () => {
  const miner_identity_email = minerIdentityEmailInput.value.trim();
  const app_user_selected_amount = appUserSelectedAmountInput.value;

  const results = convertPendingBlabs(miner_identity_email, app_user_selected_amount, 1);
  if (results.length === 0) {
    logToTerminal(terminalConvert, '[INFO]', 'info', 'No pending blab found to convert. Mine a blab first.');
  } else {
    const res = results[0];
    logToTerminal(
      terminalConvert,
      '[SINGLE_CONVERT]',
      'convert',
      `Blab: ${res.blab.substring(0, 16)}... | To: ${res.miner_identity_email} | Value: $${res.usdValue.toFixed(2)} | Hash: ${res.verificationHash}`
    );
    refreshStats();
  }
});

btnClearConvTerm.addEventListener('click', () => {
  terminalConvert.innerHTML = '';
});

btnExportConvJson.addEventListener('click', () => {
  const data = getConvertedRecords();
  downloadJSON(data, 'bitminer_converted_registry.json');
});

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialization
setupPWA();
refreshStats();
logToTerminal(terminalMine, '[SYSTEM]', 'info', 'BitMiner v3.8 initialized. Ready to mine base64 encrypted blabs.');
logToTerminal(terminalConvert, '[SYSTEM]', 'info', 'Conversion engine armed. Core parameters loaded.');
