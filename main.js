/**
 * BitMiner Application Engine
 * Authors: Kaelen Thorne, Lyra Van Dyk, Mint Reyes
 *
 * Adheres to standing requirement: Core variables [blab], [miner_identity_email],
 * and [app_user_selected_amount] must be used in the processing algorithm for
 * conversion of mined data.
 */

// --- State Management ---
const state = {
  minedBlocks: [], // Array of { id, email, encryptedEmail, key, blab, timestamp, converted, conversionDetails }
  isMiningActive: false,
  miningInterval: null,
  autoConvert: false,
  convertedValueTotal: 0,
  hashrate: 18.42,
  deferredInstallPrompt: null,
};

// Sample pools for auto-generating valid identity email addresses
const EMAIL_PREFIXES = ['satoshi', 'alice', 'bob', 'charlie', 'daedalus', 'hal.finney', 'vector', 'nexus', 'cipher', 'quantum'];
const EMAIL_DOMAINS = ['bitminer.network', 'blockcore.io', 'hashnode.org', 'crypto-node.org', 'p2p-mesh.net'];

// DOM Element References
const tabMineBtn = document.getElementById('tab-mine-btn');
const tabConvertBtn = document.getElementById('tab-convert-btn');
const viewMine = document.getElementById('view-mine');
const viewConvert = document.getElementById('view-convert');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

const startMineBtn = document.getElementById('start-mine-btn');
const singleMineBtn = document.getElementById('single-mine-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const autoConvertToggle = document.getElementById('auto-convert-toggle');

const currentGeneratedEmailEl = document.getElementById('current-generated-email');
const currentEncodedEmailEl = document.getElementById('current-encoded-email');
const currentEncodedKeyEl = document.getElementById('current-encoded-key');
const currentBlabStringEl = document.getElementById('current-blab-string');

const minerIdentityEmailInput = document.getElementById('miner-identity-email-input');
const appUserAmountInput = document.getElementById('app-user-amount-input');
const processNextBlabBtn = document.getElementById('process-next-blab-btn');
const convertAllBlabsBtn = document.getElementById('convert-all-blabs-btn');
const unprocessedCountLabel = document.getElementById('unprocessed-count-label');
const estPayoutLabel = document.getElementById('est-payout-label');

const statMinedCount = document.getElementById('stat-mined-count');
const statPendingCount = document.getElementById('stat-pending-count');
const statConvertedValue = document.getElementById('stat-converted-value');
const statHashrate = document.getElementById('stat-hashrate');

const feedTerminal = document.getElementById('feed-terminal');
const feedCountBadge = document.getElementById('feed-count-badge');
const clearTerminalBtn = document.getElementById('clear-terminal-btn');

let eventCount = 1;

// --- Utility: Terminal Logging ---
function logTerminal(tag, message, type = 'info') {
  const row = document.createElement('div');
  row.className = `terminal-row ${type}`;

  const now = new Date();
  const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;

  row.innerHTML = `
    <span class="timestamp">${timeStr}</span>
    <span class="tag ${tag.toLowerCase()}">${tag}</span>
    <span class="msg">${message}</span>
  `;

  feedTerminal.appendChild(row);
  feedTerminal.scrollTop = feedTerminal.scrollHeight;
  eventCount++;
  feedCountBadge.textContent = `${eventCount} events`;
}

// --- Helper: Base64 generator ---
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function generateRandomHex(length = 32) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a valid email
function generateRandomValidEmail() {
  const prefix = EMAIL_PREFIXES[Math.floor(Math.random() * EMAIL_PREFIXES.length)];
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  const salt = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}.${salt}@${domain}`;
}

// --- Tab Navigation ---
function setActiveTab(tabName) {
  if (tabName === 'mine') {
    tabMineBtn.classList.add('active');
    tabMineBtn.setAttribute('aria-selected', 'true');
    tabConvertBtn.classList.remove('active');
    tabConvertBtn.setAttribute('aria-selected', 'false');
    viewMine.classList.add('active');
    viewConvert.classList.remove('active');
  } else {
    tabConvertBtn.classList.add('active');
    tabConvertBtn.setAttribute('aria-selected', 'true');
    tabMineBtn.classList.remove('active');
    tabMineBtn.setAttribute('aria-selected', 'false');
    viewConvert.classList.add('active');
    viewMine.classList.remove('active');
  }
}

tabMineBtn.addEventListener('click', () => setActiveTab('mine'));
tabConvertBtn.addEventListener('click', () => setActiveTab('convert'));

// --- Mining Engine ---
/**
 * Performs a single mining cycle:
 * 1. Generates valid email
 * 2. Encrypts email into base64
 * 3. Generates base64 key value
 * 4. Merges two base64 items into a single combined base64 blab
 */
function executeMiningStep() {
  const rawEmail = generateRandomValidEmail();
  const base64Email = toBase64(rawEmail);
  const rawKey = generateRandomHex(24);
  const base64Key = toBase64(`key:${rawKey}`);

  // Core combined base64 blab string
  const blab = `${base64Email}.${base64Key}`;

  const newBlock = {
    id: 'block_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    email: rawEmail,
    encryptedEmail: base64Email,
    key: base64Key,
    blab: blab,
    timestamp: new Date().toISOString(),
    converted: false,
    conversionDetails: null,
  };

  state.minedBlocks.push(newBlock);

  // Update Inspection Display
  currentGeneratedEmailEl.textContent = rawEmail;
  currentEncodedEmailEl.textContent = base64Email;
  currentEncodedKeyEl.textContent = base64Key;
  currentBlabStringEl.textContent = blab;

  // Log to feed terminal
  logTerminal('MINE', `Mined blab [${blab.substring(0, 28)}...] for identity &lt;${rawEmail}&gt;`, 'mine');

  updateMetrics();

  // Auto-convert if enabled
  if (state.autoConvert) {
    processSingleBlabConversion(newBlock);
  }

  return newBlock;
}

// --- Core Conversion Processing Algorithm ---
/**
 * Processes a single mined block.
 * Ensures that core variables [blab], [miner_identity_email] and [app_user_selected_amount]
 * are used in the correct places in the processing algorithm.
 */
function processSingleBlabConversion(targetBlock) {
  if (!targetBlock || targetBlock.converted) {
    return null;
  }

  // Extract core variable [blab]
  const blab = targetBlock.blab;

  // Extract core variable [miner_identity_email]
  const miner_identity_email = (minerIdentityEmailInput.value || 'miner.operator@bitminer.network').trim();

  // Extract core variable [app_user_selected_amount]
  const app_user_selected_amount = parseFloat(appUserAmountInput.value) || 0.005;

  // === Processing Algorithm for Conversion ===
  // 1. Unpack blab components (identity hash & key)
  const [encodedEmailPart, encodedKeyPart] = blab.split('.');
  
  // 2. Compute cryptographic validation digest factoring in miner_identity_email and blab
  let checksum = 0;
  for (let i = 0; i < blab.length; i++) {
    checksum = (checksum + blab.charCodeAt(i) * (i + 1)) % 100000;
  }
  for (let j = 0; j < miner_identity_email.length; j++) {
    checksum = (checksum + miner_identity_email.charCodeAt(j) * (j + 3)) % 100000;
  }

  const complexityModifier = 1 + (checksum % 100) / 1000;
  
  // 3. Compute converted output value using [app_user_selected_amount]
  const convertedCryptoAmount = Number((app_user_selected_amount * complexityModifier).toFixed(6));
  const txHash = '0x' + generateRandomHex(16);

  // 4. Update block status with settlement details
  targetBlock.converted = true;
  targetBlock.conversionDetails = {
    blab: blab,
    miner_identity_email: miner_identity_email,
    app_user_selected_amount: app_user_selected_amount,
    convertedCryptoAmount: convertedCryptoAmount,
    txHash: txHash,
    processedAt: new Date().toISOString(),
  };

  state.convertedValueTotal += convertedCryptoAmount;

  // 5. Automatic output response to the feed terminal for this singular processed blab
  logTerminal(
    'CONV',
    `Converted blab [${blab.substring(0, 20)}...] &rarr; Dispatched <strong>${convertedCryptoAmount} BTC</strong> to [${miner_identity_email}] (Rate: ${app_user_selected_amount}/blab, TX: ${txHash.substring(0, 10)}...)`,
    'conv'
  );

  updateMetrics();
  return targetBlock.conversionDetails;
}

// --- Batch and Next Conversion Handlers ---
function processNextPendingBlab() {
  const nextPending = state.minedBlocks.find((b) => !b.converted);
  if (!nextPending) {
    logTerminal('SYS', 'No pending blabs available in ledger. Mine more blocks first.', 'info');
    return;
  }
  processSingleBlabConversion(nextPending);
}

function processAllPendingBlabs() {
  const pending = state.minedBlocks.filter((b) => !b.converted);
  if (pending.length === 0) {
    logTerminal('SYS', 'No pending blabs to process.', 'info');
    return;
  }
  logTerminal('SYS', `Batch converting ${pending.length} pending blab(s)...`, 'info');
  pending.forEach((block) => {
    processSingleBlabConversion(block);
  });
}

// --- Metrics Dashboard Updater ---
function updateMetrics() {
  const totalMined = state.minedBlocks.length;
  const pendingCount = state.minedBlocks.filter((b) => !b.converted).length;
  const userAmount = parseFloat(appUserAmountInput.value) || 0.005;

  statMinedCount.textContent = totalMined;
  statPendingCount.textContent = pendingCount;
  statConvertedValue.textContent = `${state.convertedValueTotal.toFixed(4)} BTC`;
  
  // Subtle variance to hashrate for live feel
  const jitter = (Math.random() * 0.4 - 0.2);
  state.hashrate = state.isMiningActive ? Math.max(12.0, state.hashrate + jitter) : 0.00;
  statHashrate.textContent = `${state.hashrate.toFixed(2)} MH/s`;

  unprocessedCountLabel.textContent = pendingCount;
  estPayoutLabel.textContent = `${(pendingCount * userAmount).toFixed(4)} BTC`;
}

// --- Mining Control Actions ---
function toggleMining() {
  if (state.isMiningActive) {
    clearInterval(state.miningInterval);
    state.miningInterval = null;
    state.isMiningActive = false;
    startMineBtn.classList.remove('active');
    startMineBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Start Mining</span>
    `;
    logTerminal('SYS', 'Continuous mining paused.', 'info');
  } else {
    state.isMiningActive = true;
    state.miningInterval = setInterval(() => {
      executeMiningStep();
    }, 2200);
    startMineBtn.classList.add('active');
    startMineBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
      <span>Stop Mining</span>
    `;
    logTerminal('SYS', 'Continuous mining worker started.', 'mine');
    executeMiningStep();
  }
  updateMetrics();
}

startMineBtn.addEventListener('click', toggleMining);
singleMineBtn.addEventListener('click', () => executeMiningStep());

autoConvertToggle.addEventListener('change', (e) => {
  state.autoConvert = e.target.checked;
  logTerminal('SYS', `Auto-convert mode ${state.autoConvert ? 'ENABLED' : 'DISABLED'}.`, 'info');
});

processNextBlabBtn.addEventListener('click', processNextPendingBlab);
convertAllBlabsBtn.addEventListener('click', processAllPendingBlabs);

appUserAmountInput.addEventListener('input', updateMetrics);

clearDataBtn.addEventListener('click', () => {
  if (state.isMiningActive) {
    toggleMining();
  }
  state.minedBlocks = [];
  state.convertedValueTotal = 0;
  currentGeneratedEmailEl.textContent = 'Ledger reset. Waiting for miner...';
  currentEncodedEmailEl.textContent = '-';
  currentEncodedKeyEl.textContent = '-';
  currentBlabStringEl.textContent = '-';
  logTerminal('SYS', 'Mined blab ledger and metrics cleared.', 'info');
  updateMetrics();
});

exportJsonBtn.addEventListener('click', () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.minedBlocks, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `bitminer-ledger-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  logTerminal('SYS', `Exported ${state.minedBlocks.length} records to JSON file.`, 'info');
});

clearTerminalBtn.addEventListener('click', () => {
  feedTerminal.innerHTML = '';
  eventCount = 0;
  feedCountBadge.textContent = '0 events';
  logTerminal('SYS', 'Terminal feed buffer cleared.', 'info');
});

// --- PWA Functionality ---
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.deferredInstallPrompt = e;
  pwaInstallBtn.classList.remove('hidden');
});

pwaInstallBtn.addEventListener('click', async () => {
  if (state.deferredInstallPrompt) {
    state.deferredInstallPrompt.prompt();
    const { outcome } = await state.deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      pwaInstallBtn.classList.add('hidden');
      logTerminal('SYS', 'BitMiner PWA installed on device.', 'info');
    }
    state.deferredInstallPrompt = null;
  }
});

// Register Service Worker for PWA if supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration skipped:', err);
    });
  });
}

// Initial setup
updateMetrics();
console.log('BitMiner application initialized');
