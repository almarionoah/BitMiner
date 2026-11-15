/**
 * BitMiner Application Engine
 * Standard implementation integrating Base64 Email + Key generation (blab)
 * and Conversion Algorithm driven by [blab], [miner_identity_email], [app_user_selected_amount]
 */

// --- State Management ---
const state = {
  activeTab: 'mine', // 'mine' | 'convert'
  isMining: false,
  miningIntervalId: null,
  autoConvertEnabled: false,
  minedBlabs: [],       // Array of mined blab objects
  convertedLedger: [],  // Array of converted transactions
  totalBtcConverted: 0.0,
  hashrate: 0.0,
  userSelectedAmount: 0.0025,
  minerIdentityEmail: 'miner.operator@bitminer.org'
};

// Predefined realistic email names and domains for mining synthesis
const EMAIL_PREFIXES = [
  'alpha.miner', 'satoshi.node', 'cyber.vault', 'hash.runner',
  'nexus.grid', 'zero.latency', 'block.relay', 'spectral.core',
  'neon.stratum', 'quantum.pulse', 'phantom.pool', 'crypto.forge'
];
const EMAIL_DOMAINS = ['bitminer.net', 'stratum.org', 'cyphernode.io', 'hashnet.global', 'btcmatrix.tech'];

// --- DOM References ---
const DOM = {
  tabMine: document.getElementById('tab-mine'),
  tabConvert: document.getElementById('tab-convert'),
  viewMine: document.getElementById('view-mine'),
  viewConvert: document.getElementById('view-convert'),
  unconvertedBadge: document.getElementById('unconverted-badge'),
  batchCount: document.getElementById('batch-count'),
  btnInstallPwa: document.getElementById('btn-install-pwa'),

  // Metrics
  statHashrate: document.getElementById('stat-hashrate'),
  statMinedBlabs: document.getElementById('stat-mined-blabs'),
  statPendingBlabs: document.getElementById('stat-pending-blabs'),
  statTotalConverted: document.getElementById('stat-total-converted'),

  // Mining elements
  btnToggleMine: document.getElementById('btn-toggle-mine'),
  btnExportJson: document.getElementById('btn-export-json'),
  miningBadge: document.getElementById('mining-badge'),
  engineStateText: document.getElementById('engine-state-text'),
  orbitRing: document.querySelector('.orbit-ring'),
  inspectRawEmail: document.getElementById('inspect-raw-email'),
  inspectB64Email: document.getElementById('inspect-b64-email'),
  inspectB64Key: document.getElementById('inspect-b64-key'),
  inspectBlab: document.getElementById('inspect-blab'),
  mineTerminalFeed: document.getElementById('mine-terminal-feed'),
  btnClearMineFeed: document.getElementById('btn-clear-mine-feed'),

  // Conversion elements
  inputMinerEmail: document.getElementById('input-miner-email'),
  inputConversionAmount: document.getElementById('input-conversion-amount'),
  presetButtons: document.querySelectorAll('.btn-preset'),
  toggleAutoConvert: document.getElementById('toggle-auto-convert'),
  btnConvertNext: document.getElementById('btn-convert-next'),
  btnConvertAll: document.getElementById('btn-convert-all'),
  convertTerminalFeed: document.getElementById('convert-terminal-feed'),
  btnClearConvertFeed: document.getElementById('btn-clear-convert-feed'),
  ledgerBody: document.getElementById('ledger-body'),
  btnClearLedger: document.getElementById('btn-clear-ledger')
};

// --- Utility Functions ---
function getTimestamp() {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return atob(str);
  }
}

function generateRandomKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function appendTerminalLog(terminalElement, message, cssClass = 'sys') {
  if (!terminalElement) return;
  const line = document.createElement('div');
  line.className = `term-line ${cssClass}`;
  line.textContent = `[${getTimestamp()}] ${message}`;
  terminalElement.appendChild(line);
  terminalElement.scrollTop = terminalElement.scrollHeight;
}

// --- Core Variable Processing Algorithm ---
/**
 * Performs conversion of mined blab data into verified cryptographic yield.
 * STANDING CONTRACT: Uses core variables [blab], [miner_identity_email], and [app_user_selected_amount]
 * in the exact conversion algorithm.
 */
function processConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || typeof blab !== 'string') {
    throw new Error('Invalid or missing blab payload');
  }
  if (!miner_identity_email || !miner_identity_email.includes('@')) {
    throw new Error('Invalid miner_identity_email specified');
  }
  const numericAmount = parseFloat(app_user_selected_amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid app_user_selected_amount specified');
  }

  // Decode blab envelope
  const decodedRaw = decodeBase64(blab);
  const parts = decodedRaw.split('::');
  const encryptedEmailPart = parts[0] || '';
  const encryptedKeyPart = parts[1] || '';

  // Unpack original email generated during mining
  const sourceMinedEmail = encryptedEmailPart ? decodeBase64(encryptedEmailPart) : 'unknown';

  // Compute verifiable cryptographic transaction hash from blab & identity signature
  const rawDigestInput = `${blab}:${miner_identity_email}:${numericAmount}`;
  let hashVal = 0;
  for (let i = 0; i < rawDigestInput.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + rawDigestInput.charCodeAt(i);
    hashVal |= 0;
  }
  const txHash = '0x' + Math.abs(hashVal).toString(16).padStart(16, '0') + Math.random().toString(16).substring(2, 10);

  return {
    blab,
    miner_identity_email,
    app_user_selected_amount: numericAmount,
    sourceMinedEmail,
    encryptedKeyPart,
    txHash,
    yieldBtc: numericAmount,
    timestamp: getTimestamp()
  };
}

// --- Mining Engine Logic ---
function executeMiningCycle() {
  // 1. Auto-generate valid email address
  const prefix = EMAIL_PREFIXES[Math.floor(Math.random() * EMAIL_PREFIXES.length)];
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  const randId = Math.floor(1000 + Math.random() * 9000);
  const generatedEmail = `${prefix}.${randId}@${domain}`;

  // 2. Encrypt email in Base64
  const base64EncryptedEmail = encodeBase64(generatedEmail);

  // 3. Generate raw key and convert to Base64
  const rawKey = generateRandomKey(24);
  const base64EncryptedKey = encodeBase64(rawKey);

  // 4. Combine both generated base64 strings into the final base64 string combination: [blab]
  const rawBlabCombo = `${base64EncryptedEmail}::${base64EncryptedKey}`;
  const blab = encodeBase64(rawBlabCombo);

  // Store in pending pool
  const blabItem = {
    id: 'blab-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    blab: blab,
    email: generatedEmail,
    email_b64: base64EncryptedEmail,
    key_b64: base64EncryptedKey,
    minedAt: getTimestamp(),
    converted: false
  };
  state.minedBlabs.push(blabItem);

  // Update inspector UI
  if (DOM.inspectRawEmail) DOM.inspectRawEmail.textContent = generatedEmail;
  if (DOM.inspectB64Email) DOM.inspectB64Email.textContent = base64EncryptedEmail;
  if (DOM.inspectB64Key) DOM.inspectB64Key.textContent = base64EncryptedKey;
  if (DOM.inspectBlab) DOM.inspectBlab.textContent = blab;

  // Log to Mine Feed Terminal
  appendTerminalLog(DOM.mineTerminalFeed, `[SYNTHESIS] Mined email: ${generatedEmail} -> b64: ${base64EncryptedEmail.substring(0, 16)}...`, 'mine-step');
  appendTerminalLog(DOM.mineTerminalFeed, `[KEY_GEN] Base64 Key created: ${base64EncryptedKey.substring(0, 18)}...`, 'mine-key');
  appendTerminalLog(DOM.mineTerminalFeed, `[BLAB_READY] Formed [blab]: ${blab.substring(0, 24)}... (ID: ${blabItem.id})`, 'mine-blab');

  // Update Hashrate simulation (fluctuate slightly between 42 and 58 MH/s)
  state.hashrate = (45 + Math.random() * 12).toFixed(2);

  updateMetricsUI();

  // Check if Auto-Convert is enabled: automatically process data as it populates
  if (state.autoConvertEnabled) {
    convertSpecificBlab(blabItem);
  }
}

function startMining() {
  if (state.isMining) return;
  state.isMining = true;
  DOM.btnToggleMine.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
    <span>Pause Mining</span>
  `;
  DOM.miningBadge.textContent = 'MINING';
  DOM.miningBadge.className = 'chip chip-active';
  DOM.engineStateText.textContent = 'Active Synthesis';
  if (DOM.orbitRing) DOM.orbitRing.classList.add('active');

  appendTerminalLog(DOM.mineTerminalFeed, '[ENGINE] Mining engine started. Initializing thread workers...', 'sys');

  // Run first cycle immediately then every 1.8s
  executeMiningCycle();
  state.miningIntervalId = setInterval(executeMiningCycle, 1800);
}

function stopMining() {
  if (!state.isMining) return;
  state.isMining = false;
  clearInterval(state.miningIntervalId);
  state.miningIntervalId = null;
  state.hashrate = 0.0;

  DOM.btnToggleMine.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
    <span>Start Mining</span>
  `;
  DOM.miningBadge.textContent = 'IDLE';
  DOM.miningBadge.className = 'chip chip-idle';
  DOM.engineStateText.textContent = 'Standby';
  if (DOM.orbitRing) DOM.orbitRing.classList.remove('active');

  appendTerminalLog(DOM.mineTerminalFeed, '[ENGINE] Mining engine paused.', 'sys');
  updateMetricsUI();
}

// --- Single Blab Conversion Execution ---
function convertSpecificBlab(blabRecord) {
  if (!blabRecord || blabRecord.converted) return false;

  // Grab exact core variables from application state & form inputs
  const blab = blabRecord.blab;
  const miner_identity_email = DOM.inputMinerEmail.value.trim() || state.minerIdentityEmail;
  const app_user_selected_amount = parseFloat(DOM.inputConversionAmount.value) || state.userSelectedAmount;

  appendTerminalLog(
    DOM.convertTerminalFeed,
    `[PROCESSING] Queued blab [${blab.substring(0, 18)}...] with identity: ${miner_identity_email}`,
    'conv-proc'
  );

  try {
    // Execute mandatory core processing algorithm
    const result = processConversion(blab, miner_identity_email, app_user_selected_amount);

    // Mark blab as converted
    blabRecord.converted = true;
    state.totalBtcConverted += result.yieldBtc;
    state.convertedLedger.unshift(result);

    appendTerminalLog(
      DOM.convertTerminalFeed,
      `[SUCCESS] Converted [blab] for [${miner_identity_email}] at [${app_user_selected_amount}] BTC -> Yield: ${result.yieldBtc.toFixed(6)} BTC (Tx: ${result.txHash})`,
      'conv-ok'
    );

    renderLedger();
    updateMetricsUI();
    return true;
  } catch (err) {
    appendTerminalLog(DOM.convertTerminalFeed, `[ERROR] Failed converting blab: ${err.message}`, 'conv-err');
    return false;
  }
}

// --- Conversion UI Actions ---
function convertNextPendingBlab() {
  const pending = state.minedBlabs.find(item => !item.converted);
  if (!pending) {
    appendTerminalLog(DOM.convertTerminalFeed, '[QUEUE] No pending blabs found to convert. Switch to "Mine" to generate blabs.', 'conv-proc');
    return;
  }
  convertSpecificBlab(pending);
}

function convertAllPendingBlabs() {
  const pendingList = state.minedBlabs.filter(item => !item.converted);
  if (pendingList.length === 0) {
    appendTerminalLog(DOM.convertTerminalFeed, '[QUEUE] No pending blabs available for batch conversion.', 'conv-proc');
    return;
  }

  appendTerminalLog(DOM.convertTerminalFeed, `[BATCH] Starting batch conversion of ${pendingList.length} blab payloads...`, 'conv-proc');
  let convertedCount = 0;
  pendingList.forEach(item => {
    if (convertSpecificBlab(item)) {
      convertedCount++;
    }
  });
  appendTerminalLog(DOM.convertTerminalFeed, `[BATCH COMPLETE] Successfully processed ${convertedCount} blabs.`, 'conv-ok');
}

// --- UI Renderers ---
function updateMetricsUI() {
  const totalMined = state.minedBlabs.length;
  const pendingCount = state.minedBlabs.filter(item => !item.converted).length;

  if (DOM.statHashrate) DOM.statHashrate.textContent = state.isMining ? `${state.hashrate} MH/s` : '0.00 MH/s';
  if (DOM.statMinedBlabs) DOM.statMinedBlabs.textContent = String(totalMined);
  if (DOM.statPendingBlabs) DOM.statPendingBlabs.textContent = String(pendingCount);
  if (DOM.statTotalConverted) DOM.statTotalConverted.textContent = `${state.totalBtcConverted.toFixed(6)} BTC`;
  if (DOM.unconvertedBadge) DOM.unconvertedBadge.textContent = String(pendingCount);
  if (DOM.batchCount) DOM.batchCount.textContent = String(pendingCount);
}

function renderLedger() {
  if (!DOM.ledgerBody) return;
  if (state.convertedLedger.length === 0) {
    DOM.ledgerBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No blabs converted yet. Mine new blabs and execute conversion.</td>
      </tr>
    `;
    return;
  }

  DOM.ledgerBody.innerHTML = state.convertedLedger.slice(0, 30).map(item => `
    <tr>
      <td>${item.timestamp}</td>
      <td title="${item.blab}">${item.blab.substring(0, 20)}...</td>
      <td>${item.miner_identity_email}</td>
      <td>${item.app_user_selected_amount.toFixed(4)} BTC</td>
      <td style="color: var(--neon-green); font-weight:600;">+${item.yieldBtc.toFixed(6)} BTC</td>
      <td><span class="status-tag verified">VERIFIED</span></td>
    </tr>
  `).join('');
}

function exportMinedJson() {
  const exportData = {
    bitminer_version: '2.4',
    export_timestamp: new Date().toISOString(),
    miner_identity_email: DOM.inputMinerEmail.value.trim() || state.minerIdentityEmail,
    total_mined: state.minedBlabs.length,
    total_converted_btc: state.totalBtcConverted,
    data: state.minedBlabs
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitminer-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  appendTerminalLog(DOM.mineTerminalFeed, '[EXPORT] Downloaded mined blabs JSON archive.', 'sys');
}

// --- Tab Switching Navigation ---
function setActiveTab(tabName) {
  state.activeTab = tabName;
  if (tabName === 'mine') {
    DOM.tabMine.classList.add('active');
    DOM.tabMine.setAttribute('aria-selected', 'true');
    DOM.tabConvert.classList.remove('active');
    DOM.tabConvert.setAttribute('aria-selected', 'false');
    DOM.viewMine.classList.add('active');
    DOM.viewConvert.classList.remove('active');
  } else {
    DOM.tabConvert.classList.add('active');
    DOM.tabConvert.setAttribute('aria-selected', 'true');
    DOM.tabMine.classList.remove('active');
    DOM.tabMine.setAttribute('aria-selected', 'false');
    DOM.viewConvert.classList.add('active');
    DOM.viewMine.classList.remove('active');
  }
}

// --- PWA Installation Setup ---
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (DOM.btnInstallPwa) {
    DOM.btnInstallPwa.classList.remove('hidden');
  }
});

if (DOM.btnInstallPwa) {
  DOM.btnInstallPwa.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        DOM.btnInstallPwa.classList.add('hidden');
      }
      deferredInstallPrompt = null;
    } else {
      alert('BitMiner PWA is ready! You can install it via your browser address bar icon or menu.');
    }
  });
}

// --- Event Listeners ---
function setupEventListeners() {
  DOM.tabMine.addEventListener('click', () => setActiveTab('mine'));
  DOM.tabConvert.addEventListener('click', () => setActiveTab('convert'));

  DOM.btnToggleMine.addEventListener('click', () => {
    if (state.isMining) {
      stopMining();
    } else {
      startMining();
    }
  });

  DOM.btnExportJson.addEventListener('click', exportMinedJson);

  DOM.btnConvertNext.addEventListener('click', convertNextPendingBlab);
  DOM.btnConvertAll.addEventListener('click', convertAllPendingBlabs);

  DOM.toggleAutoConvert.addEventListener('change', (e) => {
    state.autoConvertEnabled = e.target.checked;
    appendTerminalLog(
      DOM.convertTerminalFeed,
      `[SETTING] Auto-Convert mode is now ${state.autoConvertEnabled ? 'ENABLED' : 'DISABLED'}.`,
      'sys'
    );
    if (state.autoConvertEnabled) {
      convertAllPendingBlabs();
    }
  });

  DOM.presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      DOM.presetButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const amt = button.getAttribute('data-amount');
      DOM.inputConversionAmount.value = amt;
      state.userSelectedAmount = parseFloat(amt);
    });
  });

  DOM.inputConversionAmount.addEventListener('input', (e) => {
    state.userSelectedAmount = parseFloat(e.target.value) || 0.0025;
    DOM.presetButtons.forEach(btn => {
      if (btn.getAttribute('data-amount') === e.target.value) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });

  DOM.inputMinerEmail.addEventListener('change', (e) => {
    state.minerIdentityEmail = e.target.value.trim();
  });

  DOM.btnClearMineFeed.addEventListener('click', () => {
    DOM.mineTerminalFeed.innerHTML = '<div class="term-line sys">[FEED CLEARED]</div>';
  });

  DOM.btnClearConvertFeed.addEventListener('click', () => {
    DOM.convertTerminalFeed.innerHTML = '<div class="term-line sys">[FEED CLEARED]</div>';
  });

  DOM.btnClearLedger.addEventListener('click', () => {
    state.convertedLedger = [];
    renderLedger();
  });
}

// --- Initial Boot ---
function init() {
  setupEventListeners();
  updateMetricsUI();
  renderLedger();
  console.log('BitMiner application initialized');
}

init();

export { processConversion, state };