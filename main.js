/**
 * BitMiner — Decentralized Base64 Crypto Miner & Conversion Node
 * Core variables requirement: [blab], [miner_identity_email], [app_user_selected_amount]
 */

// --- State Management ---
const state = {
  activeTab: 'mine',
  isMining: false,
  mineIntervalMs: 1200,
  mineTimer: null,
  autoConvert: false,
  
  // Stored mined data entries: { id, rawEmail, miner_identity_email, base64Email, base64Key, blab, timestamp, converted, convertedYield, txHash }
  minedLedger: [],
  convertedCount: 0,
  totalConvertedYield: 0,
  
  // Core variables tracked in state
  miner_identity_email: 'operator@bitminer.network',
  app_user_selected_amount: 0.050,

  // PWA deferred prompt
  deferredPrompt: null
};

// Pre-defined random email segments for realistic valid email generation
const EMAIL_USERNAMES = ['miner.node', 'satoshi.sec', 'cipher.vault', 'hash.runner', 'crypt.core', 'delta.matrix', 'quantum.pulse', 'zero.byte', 'proxy.chain', 'atlas.key'];
const EMAIL_DOMAINS = ['bitminer.network', 'crypto.org', 'secureshard.io', 'ledgerblock.net', 'vaultprotocol.eth', 'hashgrid.cloud'];

// Load persisted state from localStorage if available
function loadPersistedState() {
  try {
    const saved = localStorage.getItem('bitminer_ledger_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.ledger)) {
        state.minedLedger = parsed.ledger;
        state.convertedCount = parsed.convertedCount || 0;
        state.totalConvertedYield = parsed.totalConvertedYield || 0;
      }
    }
    const savedEmail = localStorage.getItem('bitminer_miner_identity_email');
    if (savedEmail) state.miner_identity_email = savedEmail;
    const savedAmount = localStorage.getItem('bitminer_app_user_selected_amount');
    if (savedAmount) state.app_user_selected_amount = parseFloat(savedAmount) || 0.050;
  } catch (err) {
    console.warn('Unable to load localStorage ledger:', err);
  }
}

function persistState() {
  try {
    localStorage.setItem('bitminer_ledger_v2', JSON.stringify({
      ledger: state.minedLedger,
      convertedCount: state.convertedCount,
      totalConvertedYield: state.totalConvertedYield
    }));
    localStorage.setItem('bitminer_miner_identity_email', state.miner_identity_email);
    localStorage.setItem('bitminer_app_user_selected_amount', state.app_user_selected_amount.toString());
  } catch (err) {
    console.warn('Unable to save to localStorage:', err);
  }
}

// --- Utility Cryptographic & Base64 Routines ---
function generateRandomEmail() {
  const user = EMAIL_USERNAMES[Math.floor(Math.random() * EMAIL_USERNAMES.length)];
  const randHex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  return `${user}.${randHex}@${domain}`;
}

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function generateRandomBase64Key(byteLength = 16) {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

function formatTime(date = new Date()) {
  return date.toTimeString().split(' ')[0] + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

// --- Terminal Logging Engines ---
function logToTerminal(terminalId, tag, message, tagClass = 'system') {
  const container = document.getElementById(terminalId);
  if (!container) return;

  const line = document.createElement('div');
  line.className = 'term-line';
  line.innerHTML = `
    <span class="term-time">[${formatTime()}]</span>
    <span class="term-tag ${tagClass}">${tag}</span>
    <span class="term-msg">${message}</span>
  `;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

// --- UI Update Pipeline ---
function updateMetricsUI() {
  const totalMined = state.minedLedger.length;
  const pendingCount = state.minedLedger.filter(item => !item.converted).length;
  const convertedCount = state.convertedCount;
  const totalYield = state.totalConvertedYield;

  const elTotalMined = document.getElementById('stat-mined-blabs');
  const elPending = document.getElementById('stat-pending-blabs');
  const elConvertedCount = document.getElementById('stat-converted-count');
  const elTotalYield = document.getElementById('stat-total-yield');
  const elActiveIdentity = document.getElementById('active-identity-label');
  const elActiveRate = document.getElementById('active-rate-label');

  if (elTotalMined) elTotalMined.textContent = totalMined.toString();
  if (elPending) elPending.textContent = pendingCount.toString();
  if (elConvertedCount) elConvertedCount.textContent = convertedCount.toString();
  if (elTotalYield) elTotalYield.textContent = totalYield.toFixed(6) + ' BTC';
  if (elActiveIdentity) elActiveIdentity.textContent = state.miner_identity_email || 'Not configured';
  if (elActiveRate) elActiveRate.textContent = `${state.app_user_selected_amount.toFixed(3)} BTC / blab`;
}

// --- Mining Pipeline ---
function executeMineCycle() {
  // 1. Auto generate valid email address
  const rawGeneratedEmail = generateRandomEmail();
  
  // 2. Base64 encryption of valid email address
  const encryptedEmail = encodeBase64(rawGeneratedEmail);
  
  // 3. Generate cryptographic Base64 key value
  const base64KeyValue = generateRandomBase64Key(18);
  
  // 4. Combine the two generated base64 strings into the unified core [blab]
  const blab = `${encryptedEmail}.${base64KeyValue}`;

  const record = {
    id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    rawEmail: rawGeneratedEmail,
    base64Email: encryptedEmail,
    base64Key: base64KeyValue,
    blab: blab,
    timestamp: Date.now(),
    converted: false,
    convertedYield: 0,
    txHash: null
  };

  state.minedLedger.push(record);
  persistState();
  updateMetricsUI();

  // Update Real-time Block Inspector UI
  const elRawEmail = document.getElementById('raw-email-preview');
  const elEncEmail = document.getElementById('enc-email-preview');
  const elEncKey = document.getElementById('enc-key-preview');
  const elCombinedBlab = document.getElementById('combined-blab-preview');

  if (elRawEmail) elRawEmail.textContent = rawGeneratedEmail;
  if (elEncEmail) elEncEmail.textContent = encryptedEmail;
  if (elEncKey) elEncKey.textContent = base64KeyValue;
  if (elCombinedBlab) elCombinedBlab.textContent = blab;

  // Output responses to Mining Feed Terminal
  logToTerminal('mining-terminal-output', 'MINE-EMAIL', `Identity: ${rawGeneratedEmail} ➔ Base64: ${encryptedEmail}`, 'mine');
  logToTerminal('mining-terminal-output', 'KEY-GEN', `Cryptographic Key: ${base64KeyValue}`, 'key');
  logToTerminal('mining-terminal-output', 'BLAB-CREATED', `Synthesized [blab]: ${blab}`, 'blab');

  // Check Auto-Convert requirement: process data as it populates the json file
  if (state.autoConvert) {
    processSingleBlabConversion(record);
  }
}

// --- Conversion Algorithm Core Engine ---
/**
 * Core algorithm utilizing explicit core variables:
 * [blab], [miner_identity_email] and [app_user_selected_amount]
 */
function processSingleBlabConversion(targetRecord = null) {
  let miner_identity_email = state.miner_identity_email;
  let app_user_selected_amount = state.app_user_selected_amount;

  if (!miner_identity_email || miner_identity_email.trim() === '') {
    logToTerminal('conversion-terminal-output', 'WARN', 'Conversion aborted: [miner_identity_email] is required.', 'warn');
    return false;
  }

  if (!app_user_selected_amount || isNaN(app_user_selected_amount) || app_user_selected_amount <= 0) {
    logToTerminal('conversion-terminal-output', 'WARN', 'Conversion aborted: [app_user_selected_amount] must be greater than 0.', 'warn');
    return false;
  }

  // Find next unconverted record or use target
  const record = targetRecord || state.minedLedger.find(item => !item.converted);
  if (!record) {
    logToTerminal('conversion-terminal-output', 'IDLE', 'No pending [blab] blocks available to convert.', 'system');
    return false;
  }

  // Extract core variable [blab]
  const blab = record.blab;

  // Conversion processing algorithm:
  // 1. Verify blab integrity by checking parts
  const parts = blab.split('.');
  if (parts.length !== 2) {
    logToTerminal('conversion-terminal-output', 'ERROR', `Invalid blab structure rejected: ${blab}`, 'error');
    return false;
  }

  // 2. Cryptographic checksum factor derived from blab payload and miner identity email
  let blabEntropy = 0;
  for (let i = 0; i < blab.length; i++) {
    blabEntropy += blab.charCodeAt(i);
  }
  for (let j = 0; j < miner_identity_email.length; j++) {
    blabEntropy += miner_identity_email.charCodeAt(j);
  }

  // 3. Compute final converted yield value using [app_user_selected_amount]
  // Normalization factor fluctuates within 0.95x - 1.05x based on blab proof-of-work entropy
  const difficultyMultiplier = 0.95 + ((blabEntropy % 100) / 1000);
  const singleConvertedYield = parseFloat((app_user_selected_amount * difficultyMultiplier).toFixed(6));

  // 4. Generate transaction proof hash using [blab], [miner_identity_email], [app_user_selected_amount]
  const proofSeed = `${blab}::${miner_identity_email}::${app_user_selected_amount}::${Date.now()}`;
  const txHash = '0x' + encodeBase64(proofSeed).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32).toLowerCase();

  // 5. Update state and record
  record.converted = true;
  record.convertedYield = singleConvertedYield;
  record.txHash = txHash;
  record.convertedToEmail = miner_identity_email;
  record.conversionRate = app_user_selected_amount;

  state.convertedCount += 1;
  state.totalConvertedYield += singleConvertedYield;
  persistState();
  updateMetricsUI();

  // 6. Give automatic output response to the feed terminal for each singular processed final base64 string
  logToTerminal(
    'conversion-terminal-output',
    'CONVERTED',
    `Processed [blab]: ${blab.slice(0, 24)}... | Miner: ${miner_identity_email} | Amount: ${app_user_selected_amount} BTC | Yield: +${singleConvertedYield} BTC | TX: ${txHash}`,
    'convert'
  );

  return true;
}

function convertAllPendingBlabs() {
  const pending = state.minedLedger.filter(item => !item.converted);
  if (pending.length === 0) {
    logToTerminal('conversion-terminal-output', 'IDLE', 'No pending [blab] entries to convert.', 'system');
    return;
  }

  logToTerminal('conversion-terminal-output', 'BATCH-START', `Initiating batch conversion of ${pending.length} [blab] items...`, 'system');
  let count = 0;
  for (const item of pending) {
    const success = processSingleBlabConversion(item);
    if (success) count++;
  }
  logToTerminal('conversion-terminal-output', 'BATCH-COMPLETE', `Successfully converted ${count} [blab] records for ${state.miner_identity_email}.`, 'convert');
}

// --- Mining Loop Controls ---
function startMining() {
  if (state.isMining) return;
  state.isMining = true;
  
  const toggleBtn = document.getElementById('toggle-mine-btn');
  const badge = document.getElementById('miner-status-badge');
  if (toggleBtn) {
    toggleBtn.innerHTML = '<span class="btn-icon">⏹</span><span class="btn-label">Stop Mining</span>';
  }
  if (badge) {
    badge.textContent = 'MINING ACTIVE';
    badge.className = 'status-indicator mining';
  }

  document.getElementById('stat-hashrate').textContent = (1000 / state.mineIntervalMs).toFixed(2) + ' H/s';
  logToTerminal('mining-terminal-output', 'NODE', `BitMiner worker node started at ${state.mineIntervalMs}ms interval.`, 'system');

  executeMineCycle();
  state.mineTimer = setInterval(executeMineCycle, state.mineIntervalMs);
}

function stopMining() {
  if (!state.isMining) return;
  state.isMining = false;
  clearInterval(state.mineTimer);
  state.mineTimer = null;

  const toggleBtn = document.getElementById('toggle-mine-btn');
  const badge = document.getElementById('miner-status-badge');
  if (toggleBtn) {
    toggleBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-label">Start Mining</span>';
  }
  if (badge) {
    badge.textContent = 'STANDBY';
    badge.className = 'status-indicator standby';
  }

  document.getElementById('stat-hashrate').textContent = '0.00 H/s';
  logToTerminal('mining-terminal-output', 'NODE', 'Mining worker paused.', 'system');
}

// --- Tab Navigation Setup ---
function setupTabs() {
  const mineBtn = document.getElementById('tab-mine-btn');
  const convertBtn = document.getElementById('tab-convert-btn');
  const secMine = document.getElementById('section-mine');
  const secConvert = document.getElementById('section-convert');

  function selectTab(tab) {
    state.activeTab = tab;
    if (tab === 'mine') {
      mineBtn.classList.add('active');
      convertBtn.classList.remove('active');
      secMine.classList.add('active');
      secConvert.classList.remove('active');
    } else {
      convertBtn.classList.add('active');
      mineBtn.classList.remove('active');
      secConvert.classList.add('active');
      secMine.classList.remove('active');
    }
    updateMetricsUI();
  }

  mineBtn.addEventListener('click', () => selectTab('mine'));
  convertBtn.addEventListener('click', () => selectTab('convert'));
}

// --- Event Listeners Setup ---
function setupEvents() {
  // Mine Controls
  document.getElementById('toggle-mine-btn')?.addEventListener('click', () => {
    if (state.isMining) stopMining();
    else startMining();
  });

  document.getElementById('mine-single-btn')?.addEventListener('click', () => {
    executeMineCycle();
  });

  document.getElementById('clear-data-btn')?.addEventListener('click', () => {
    if (confirm('Reset all mined blabs and conversion history?')) {
      state.minedLedger = [];
      state.convertedCount = 0;
      state.totalConvertedYield = 0;
      persistState();
      updateMetricsUI();
      logToTerminal('mining-terminal-output', 'RESET', 'Ledger cleared.', 'warn');
      logToTerminal('conversion-terminal-output', 'RESET', 'Ledger cleared.', 'warn');
    }
  });

  // Speed Slider
  const slider = document.getElementById('mine-speed-slider');
  const speedLabel = document.getElementById('speed-label');
  slider?.addEventListener('input', (e) => {
    state.mineIntervalMs = parseInt(e.target.value, 10);
    if (speedLabel) speedLabel.textContent = (state.mineIntervalMs / 1000).toFixed(1) + 's';
    if (state.isMining) {
      clearInterval(state.mineTimer);
      state.mineTimer = setInterval(executeMineCycle, state.mineIntervalMs);
      document.getElementById('stat-hashrate').textContent = (1000 / state.mineIntervalMs).toFixed(2) + ' H/s';
    }
  });

  // Conversion Form Inputs
  const emailInput = document.getElementById('input-miner-email');
  const amountInput = document.getElementById('input-convert-amount');

  if (emailInput) {
    emailInput.value = state.miner_identity_email;
    emailInput.addEventListener('input', (e) => {
      state.miner_identity_email = e.target.value.trim();
      persistState();
      updateMetricsUI();
    });
  }

  if (amountInput) {
    amountInput.value = state.app_user_selected_amount;
    amountInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.app_user_selected_amount = val;
        persistState();
        updateMetricsUI();
      }
    });
  }

  // Auto Convert Toggle
  const autoToggle = document.getElementById('toggle-autoconvert');
  autoToggle?.addEventListener('change', (e) => {
    state.autoConvert = e.target.checked;
    const badge = document.getElementById('conversion-status-badge');
    if (state.autoConvert) {
      if (badge) {
        badge.textContent = 'AUTO-CONVERT ON';
        badge.className = 'status-indicator processing';
      }
      logToTerminal('conversion-terminal-output', 'AUTO-ON', 'Auto-conversion pipeline activated. Incoming [blab] entries will be converted immediately.', 'system');
      // Immediately process any existing pending items
      convertAllPendingBlabs();
    } else {
      if (badge) {
        badge.textContent = 'IDLE';
        badge.className = 'status-indicator standby';
      }
      logToTerminal('conversion-terminal-output', 'AUTO-OFF', 'Auto-conversion pipeline paused.', 'system');
    }
  });

  // Convert Buttons
  document.getElementById('convert-all-btn')?.addEventListener('click', () => {
    convertAllPendingBlabs();
  });

  document.getElementById('convert-single-btn')?.addEventListener('click', () => {
    processSingleBlabConversion();
  });

  // Clear Feed Buttons
  document.getElementById('clear-term-mine-btn')?.addEventListener('click', () => {
    const term = document.getElementById('mining-terminal-output');
    if (term) term.innerHTML = '';
  });

  document.getElementById('clear-term-convert-btn')?.addEventListener('click', () => {
    const term = document.getElementById('conversion-terminal-output');
    if (term) term.innerHTML = '';
  });

  // Export JSON Ledger
  document.getElementById('export-json-btn')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.minedLedger, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `bitminer_ledger_${Date.now()}.json`);
    dlAnchor.click();
    dlAnchor.remove();
    logToTerminal('mining-terminal-output', 'EXPORT', `Exported ${state.minedLedger.length} [blab] blocks to JSON file.`, 'system');
  });
}

// --- Progressive Web App (PWA) Registration & Install Prompt ---
function setupPWA() {
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
  });

  installBtn?.addEventListener('click', async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      const choiceResult = await state.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        logToTerminal('mining-terminal-output', 'PWA', 'User installed BitMiner PWA application.', 'system');
      }
      state.deferredPrompt = null;
      installBtn.classList.add('hidden');
    }
  });

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    logToTerminal('mining-terminal-output', 'PWA', 'BitMiner installed successfully.', 'system');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('BitMiner Service Worker registered:', reg.scope);
    }).catch((err) => {
      console.warn('BitMiner Service Worker registration failed:', err);
    });
  }
}

// --- App Initialization ---
function initApp() {
  loadPersistedState();
  setupTabs();
  setupEvents();
  setupPWA();
  updateMetricsUI();

  logToTerminal('mining-terminal-output', 'READY', 'BitMiner protocol initialized. Cryptographic base64 mining ready.', 'system');
  logToTerminal('conversion-terminal-output', 'READY', 'Conversion engine ready. Awaiting [blab] input blocks.', 'system');
  console.log('BitMiner application initialized with core variables [blab], [miner_identity_email], [app_user_selected_amount]');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
