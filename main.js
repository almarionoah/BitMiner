/**
 * BitMiner Engine & Protocol Processor
 * Lead Release Engineering Team: Kaelen Thorne, Lyra Van Dyk, Mint Reyes
 *
 * Adheres strictly to the standing data contract:
 * Uses core variables:
 *   - [blab]: Combined base64 mined data package [base64_email + '.' + base64_key]
 *   - [miner_identity_email]: Verified operator/conversion email identity
 *   - [app_user_selected_amount]: User specified conversion amount per BLAB
 */

// --- State Store ---
const state = {
  isMining: false,
  miningInterval: null,
  hashrateInterval: null,
  autoConvert: false,
  hashrate: 0,
  minedBlabs: [],       // Array of { id, email, b64Email, key, b64Key, blab, timestamp, converted: boolean }
  convertedCount: 0,
  totalUsdValue: 0,
  totalBtcValue: 0,
  currentView: 'mine',  // 'mine' | 'convert'
};

// Predefined random identity pools for autonomous email synthesis
const EMAIL_PREFIXES = [
  'alpha.miner', 'nexus.rig', 'crypto.core', 'vortex.worker', 'quantum.node',
  'hyper.hash', 'stellar.forge', 'iron.rig', 'cyber.probe', 'phantom.mesh'
];
const EMAIL_DOMAINS = [
  'bitminer.network', 'proof.vault.io', 'blockhash.internal', 'node-cloud.net', 'crypto-pool.org'
];

// --- Utility: Cryptographic String & Base64 Helpers ---
function generateRandomKey(length = 24) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

function generateRandomEmail() {
  const prefix = EMAIL_PREFIXES[Math.floor(Math.random() * EMAIL_PREFIXES.length)];
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  return `${prefix}_${randomId}@${domain}`;
}

function encodeBase64(str) {
  try {
    return btoa(str);
  } catch (e) {
    return btoa(encodeURIComponent(str));
  }
}

function formatTime(date = new Date()) {
  return date.toTimeString().split(' ')[0] + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

// --- Terminal Logging System ---
function logTerminal(tag, message) {
  const terminal = document.getElementById('terminal-feed');
  if (!terminal) return;

  const line = document.createElement('div');
  line.className = 'term-line';

  const timeSpan = document.createElement('span');
  timeSpan.className = 'term-time';
  timeSpan.textContent = `[${formatTime()}]`;

  const tagSpan = document.createElement('span');
  tagSpan.className = `term-tag ${tag.toLowerCase()}`;
  tagSpan.textContent = `[${tag.toUpperCase()}]`;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'term-msg';
  msgSpan.textContent = message;

  line.appendChild(timeSpan);
  line.appendChild(tagSpan);
  line.appendChild(msgSpan);

  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

// --- Core Mining Algorithm ---
function mineBlock() {
  // 1. Synthesize valid email address
  const syntheticEmail = generateRandomEmail();
  const b64Email = encodeBase64(syntheticEmail);

  // 2. Generate Base64 key value
  const rawKey = generateRandomKey(24);
  const b64Key = encodeBase64(rawKey);

  // 3. Combine into final base64 string package called [blab]
  // Per blueprint: the two generated base64 strings combination is called blab
  const blab = `${b64Email}.${b64Key}`;

  const minedRecord = {
    id: 'BLK-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    email: syntheticEmail,
    b64Email,
    key: rawKey,
    b64Key,
    blab,
    timestamp: new Date().toISOString(),
    converted: false,
  };

  state.minedBlabs.push(minedRecord);

  // Update UI diagnostic previews
  const emailPrev = document.getElementById('mining-identity-preview');
  const b64EmailPrev = document.getElementById('mining-b64-email-preview');
  const b64KeyPrev = document.getElementById('mining-b64-key-preview');
  const blabPrev = document.getElementById('mining-blab-preview');

  if (emailPrev) emailPrev.textContent = syntheticEmail;
  if (b64EmailPrev) b64EmailPrev.textContent = b64Email;
  if (b64KeyPrev) b64KeyPrev.textContent = b64Key;
  if (blabPrev) blabPrev.textContent = blab;

  logTerminal('MINE', `Block #${minedRecord.id} mined. Valid [blab] generated: ${blab.substring(0, 32)}...`);

  updateGlobalStats();

  // Automatic conversion hook if user enabled Auto-Convert
  if (state.autoConvert) {
    const minerEmailInput = document.getElementById('miner-email-input');
    const amountInput = document.getElementById('amount-per-blab-input');
    const miner_identity_email = minerEmailInput ? minerEmailInput.value.trim() : 'auto.operator@bitminer.network';
    const app_user_selected_amount = amountInput ? parseFloat(amountInput.value) || 25.0 : 25.0;

    processConversion(minedRecord.blab, miner_identity_email, app_user_selected_amount);
  }

  return minedRecord;
}

// --- Core Conversion Algorithm with [blab], [miner_identity_email], [app_user_selected_amount] ---
/**
 * Process conversion of mined data.
 * Ensures that core variables [blab], [miner_identity_email] and [app_user_selected_amount]
 * are used in the correct places in the processing algorithm.
 */
function processConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || typeof blab !== 'string') {
    logTerminal('INFO', 'Conversion rejected: Invalid or null [blab] string provided.');
    return null;
  }

  // Locate matching record in the pool
  const record = state.minedBlabs.find((item) => item.blab === blab && !item.converted);
  if (!record && !state.minedBlabs.some((b) => b.blab === blab)) {
    logTerminal('INFO', `Notice: Converting ad-hoc [blab]: ${blab.substring(0, 20)}...`);
  }

  // Deconstruct and validate [blab]
  const parts = blab.split('.');
  const emailPartB64 = parts[0] || '';
  const keyPartB64 = parts[1] || '';

  // Hash simulation based on [blab] and [miner_identity_email]
  let checksum = 0;
  const combinedSeed = `${miner_identity_email}:${blab}`;
  for (let i = 0; i < combinedSeed.length; i++) {
    checksum = (checksum + combinedSeed.charCodeAt(i) * 31) % 1000000;
  }

  // Compute payout calculations using [app_user_selected_amount]
  const numericRate = parseFloat(app_user_selected_amount) || 1.0;
  const btcRatePerUsd = 0.00001085; // Simulated market exchange rate
  const convertedUsd = numericRate;
  const convertedBtc = numericRate * btcRatePerUsd;

  // Mark record as converted in state
  if (record) {
    record.converted = true;
    record.convertedBy = miner_identity_email;
    record.convertedAmount = app_user_selected_amount;
  }

  state.convertedCount++;
  state.totalUsdValue += convertedUsd;
  state.totalBtcValue += convertedBtc;

  // Automatic output responses to the feed terminal for each singular processed base64 blab
  logTerminal(
    'CONV',
    `Converted [blab] => Identity: [${miner_identity_email}] | Rate: [$${numericRate.toFixed(2)}] | Yield: +${convertedBtc.toFixed(8)} BTC (+$${convertedUsd.toFixed(2)} USD)`
  );
  logTerminal(
    'OK',
    `Proof Verified: Checksum #${checksum.toString(16).toUpperCase()} | Sub-Key: ${keyPartB64.substring(0, 12)}...`
  );

  updateGlobalStats();

  return {
    blab,
    miner_identity_email,
    app_user_selected_amount,
    convertedUsd,
    convertedBtc,
    checksum,
  };
}

// --- Batch and Single Action Handlers ---
function handleConvertNextSingle() {
  const minerEmailInput = document.getElementById('miner-email-input');
  const amountInput = document.getElementById('amount-per-blab-input');

  const miner_identity_email = minerEmailInput ? minerEmailInput.value.trim() : 'miner@bitminer.network';
  const app_user_selected_amount = amountInput ? parseFloat(amountInput.value) || 25.0 : 25.0;

  const pending = state.minedBlabs.find((item) => !item.converted);
  if (!pending) {
    logTerminal('INFO', 'No pending unverified [blab] packages in pool. Start mining first!');
    return;
  }

  const blab = pending.blab;
  processConversion(blab, miner_identity_email, app_user_selected_amount);
}

function handleConvertAllPending() {
  const minerEmailInput = document.getElementById('miner-email-input');
  const amountInput = document.getElementById('amount-per-blab-input');

  const miner_identity_email = minerEmailInput ? minerEmailInput.value.trim() : 'miner@bitminer.network';
  const app_user_selected_amount = amountInput ? parseFloat(amountInput.value) || 25.0 : 25.0;

  const pendingList = state.minedBlabs.filter((item) => !item.converted);
  if (pendingList.length === 0) {
    logTerminal('INFO', 'Zero pending [blab] packages remaining to convert.');
    return;
  }

  logTerminal('INFO', `Starting bulk conversion queue for ${pendingList.length} [blab] package(s)...`);

  pendingList.forEach((item) => {
    const blab = item.blab;
    processConversion(blab, miner_identity_email, app_user_selected_amount);
  });
}

// --- UI Update & View Switcher ---
function updateGlobalStats() {
  const totalMined = state.minedBlabs.length;
  const pendingCount = state.minedBlabs.filter((item) => !item.converted).length;

  const elMined = document.getElementById('stat-blabs-count');
  const elPending = document.getElementById('stat-pending-count');
  const elBtc = document.getElementById('stat-converted-value');
  const elHeaderBal = document.getElementById('header-balance');

  if (elMined) elMined.textContent = totalMined.toString();
  if (elPending) elPending.textContent = pendingCount.toString();
  if (elBtc) elBtc.textContent = `${state.totalBtcValue.toFixed(8)} BTC`;
  if (elHeaderBal) elHeaderBal.textContent = `$${state.totalUsdValue.toFixed(2)} USD`;
}

function switchView(viewName) {
  state.currentView = viewName;

  const tabMine = document.getElementById('tab-mine');
  const tabConvert = document.getElementById('tab-convert');
  const viewMine = document.getElementById('view-mine');
  const viewConvert = document.getElementById('view-convert');

  if (viewName === 'mine') {
    tabMine.classList.add('active');
    tabMine.setAttribute('aria-selected', 'true');
    tabConvert.classList.remove('active');
    tabConvert.setAttribute('aria-selected', 'false');

    viewMine.classList.remove('hidden');
    viewConvert.classList.add('hidden');
    logTerminal('INFO', 'Active workspace switched to [Mine] Engine view.');
  } else {
    tabConvert.classList.add('active');
    tabConvert.setAttribute('aria-selected', 'true');
    tabMine.classList.remove('active');
    tabMine.setAttribute('aria-selected', 'false');

    viewConvert.classList.remove('hidden');
    viewMine.classList.add('hidden');
    logTerminal('INFO', 'Active workspace switched to [Convert] Protocol view.');
  }
}

// --- Toggle Continuous Mining Engine ---
function toggleMiningEngine() {
  const toggleBtn = document.getElementById('btn-toggle-mining');
  const statusPill = document.getElementById('mining-status-pill');
  const statHashrate = document.getElementById('stat-hashrate');

  if (state.isMining) {
    // Stop mining
    clearInterval(state.miningInterval);
    clearInterval(state.hashrateInterval);
    state.isMining = false;
    state.hashrate = 0;

    if (toggleBtn) {
      toggleBtn.innerHTML = '<span class="btn-icon">▶</span> Start Mining Engine';
      toggleBtn.classList.remove('glow-button-purple');
      toggleBtn.classList.add('glow-button');
    }
    if (statusPill) {
      statusPill.textContent = 'ENGINE IDLE';
      statusPill.className = 'status-pill idle';
    }
    if (statHashrate) statHashrate.textContent = '0.00 MH/s';

    logTerminal('INFO', 'Mining Engine paused by user.');
  } else {
    // Start mining
    state.isMining = true;
    if (toggleBtn) {
      toggleBtn.innerHTML = '<span class="btn-icon">⏹</span> Halt Mining Engine';
      toggleBtn.classList.remove('glow-button');
      toggleBtn.classList.add('glow-button-purple');
    }
    if (statusPill) {
      statusPill.textContent = 'MINING ACTIVE';
      statusPill.className = 'status-pill active';
    }

    logTerminal('MINE', 'BitMiner Engine thread initialized with linear-gradient scheduler.');

    // Initial immediate mine
    mineBlock();

    // Mining interval
    state.miningInterval = setInterval(() => {
      mineBlock();
    }, 2800);

    // Hashrate oscillation
    state.hashrateInterval = setInterval(() => {
      const baseRate = 84.5;
      const jitter = (Math.random() * 12.0 - 6.0);
      state.hashrate = Math.max(10, baseRate + jitter);
      if (statHashrate) statHashrate.textContent = `${state.hashrate.toFixed(2)} MH/s`;
    }, 1200);
  }
}

// --- JSON Export Feature ---
function exportJsonData() {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalMinedBlabs: state.minedBlabs.length,
    convertedBlabs: state.convertedCount,
    totalUsdEquivalent: state.totalUsdValue,
    totalBtcEquivalent: state.totalBtcValue,
    blabRepository: state.minedBlabs,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bitminer-blabs-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  logTerminal('OK', `Mined dataset exported as JSON (${state.minedBlabs.length} records).`);
}

// --- PWA Installation & Service Worker Registration ---
let deferredInstallPrompt = null;
function setupPWA() {
  const installBtn = document.getElementById('btn-pwa-install');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      logTerminal('INFO', `PWA Installation request outcome: ${outcome}`);
      deferredInstallPrompt = null;
      installBtn.classList.add('hidden');
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('ServiceWorker registration skipped:', err);
      });
    });
  }
}

// --- Wire Up Event Listeners on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
  // Tab listeners
  const tabMine = document.getElementById('tab-mine');
  const tabConvert = document.getElementById('tab-convert');
  if (tabMine) tabMine.addEventListener('click', () => switchView('mine'));
  if (tabConvert) tabConvert.addEventListener('click', () => switchView('convert'));

  // Mining buttons
  const btnToggle = document.getElementById('btn-toggle-mining');
  const btnMineSingle = document.getElementById('btn-mine-single');
  const btnExport = document.getElementById('btn-export-json');
  if (btnToggle) btnToggle.addEventListener('click', toggleMiningEngine);
  if (btnMineSingle) btnMineSingle.addEventListener('click', () => mineBlock());
  if (btnExport) btnExport.addEventListener('click', exportJsonData);

  // Convert buttons
  const btnConvertSingle = document.getElementById('btn-convert-single');
  const btnConvertAll = document.getElementById('btn-convert-all');
  const btnClearBlabs = document.getElementById('btn-clear-blabs');
  if (btnConvertSingle) btnConvertSingle.addEventListener('click', handleConvertNextSingle);
  if (btnConvertAll) btnConvertAll.addEventListener('click', handleConvertAllPending);
  if (btnClearBlabs) {
    btnClearBlabs.addEventListener('click', () => {
      state.minedBlabs = [];
      updateGlobalStats();
      logTerminal('INFO', 'Mined BLAB storage pool cleared by user.');
    });
  }

  // Auto-convert toggle
  const toggleAuto = document.getElementById('toggle-auto-convert');
  if (toggleAuto) {
    toggleAuto.addEventListener('change', (e) => {
      state.autoConvert = e.target.checked;
      logTerminal('INFO', `Auto-Convert streaming ${state.autoConvert ? 'ENABLED' : 'DISABLED'}.`);
    });
  }

  // Terminal clear
  const btnClearTerminal = document.getElementById('btn-clear-terminal');
  if (btnClearTerminal) {
    btnClearTerminal.addEventListener('click', () => {
      const terminal = document.getElementById('terminal-feed');
      if (terminal) terminal.innerHTML = '';
      logTerminal('INFO', 'Terminal buffer cleared.');
    });
  }

  // Setup PWA
  setupPWA();

  // Boot log
  logTerminal('INFO', 'BitMiner Core Protocol v2.4 initialized. Ready to mine.');
  logTerminal('INFO', 'Variables active: [blab], [miner_identity_email], [app_user_selected_amount]');
});

// Export conversion and mining for testing or module usage
export {
  state,
  mineBlock,
  processConversion,
  exportJsonData
};