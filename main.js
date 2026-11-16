/**
 * BitMiner - Core Engine
 * Mining generator, Base64 encryption, Feed Terminals, and
 * Algorithm conversion utilizing [blab], [miner_identity_email], and [app_user_selected_amount].
 */

// --- State Management ---
const state = {
  activeTab: 'mine',
  isMining: false,
  miningInterval: null,
  hashRate: 0,
  minedBlabs: [],       // Raw base64 blabs awaiting or processed
  convertedBlabs: [],   // History of processed blabs
  totalRewards: 0,      // Total BTC reward accumulated
  autoConvert: false,
  deferredPwaPrompt: null
};

// --- Load Stored State (Preserve between refreshes) ---
function loadStoredData() {
  try {
    const storedMined = localStorage.getItem('bitminer_mined_blabs');
    const storedConverted = localStorage.getItem('bitminer_converted_blabs');
    const storedRewards = localStorage.getItem('bitminer_total_rewards');
    if (storedMined) state.minedBlabs = JSON.parse(storedMined);
    if (storedConverted) state.convertedBlabs = JSON.parse(storedConverted);
    if (storedRewards) state.totalRewards = parseFloat(storedRewards) || 0;
  } catch (err) {
    console.warn('Failed to parse cached data, initializing fresh state', err);
  }
}

function persistData() {
  try {
    localStorage.setItem('bitminer_mined_blabs', JSON.stringify(state.minedBlabs));
    localStorage.setItem('bitminer_converted_blabs', JSON.stringify(state.convertedBlabs));
    localStorage.setItem('bitminer_total_rewards', state.totalRewards.toString());
  } catch (err) {
    console.warn('Unable to persist to localStorage', err);
  }
}

// --- Helpers ---
function formatTimestamp() {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

function randomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomMinerEmail() {
  const domains = ['bitminer.net', 'cryptonode.org', 'hashvault.io', 'proofofwork.tech'];
  const names = ['worker', 'node', 'rig', 'agent', 'core', 'cluster'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${name}-${num}@${domain}`;
}

// Append logs to feed terminal
function logToTerminal(terminalId, tag, message, highlight = false) {
  const terminal = document.getElementById(terminalId);
  if (!terminal) return;

  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerHTML = `
    <span class="log-ts">[${formatTimestamp()}]</span>
    <span class="log-tag tag-${tag.toLowerCase()}">${tag}</span>
    <span class="log-msg ${highlight ? 'log-highlight' : ''}">${message}</span>
  `;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

// --- Core Mining Algorithm ---
/**
 * Generates valid email address in base64 encryption.
 * Once valid encrypted email is created, generates base64 key value,
 * then binds them into a base64 string called blab.
 */
function executeMiningCycle() {
  const rawEmail = generateRandomMinerEmail();
  const encryptedEmail = btoa(rawEmail);
  const rawKey = randomString(24);
  const base64Key = btoa(rawKey);

  // Combined generated base64 blab representation
  const combinedPayload = JSON.stringify({
    emailBase64: encryptedEmail,
    keyBase64: base64Key,
    blockNonce: Math.floor(Math.random() * 100000000),
    timestamp: Date.now()
  });
  const generatedBlab = btoa(combinedPayload);

  // Update Inspection Panel
  const emailHashEl = document.getElementById('current-email-hash');
  const keyHashEl = document.getElementById('current-key-hash');
  const blabHashEl = document.getElementById('current-blab-hash');

  if (emailHashEl) emailHashEl.textContent = encryptedEmail + ' (' + rawEmail + ')';
  if (keyHashEl) keyHashEl.textContent = base64Key;
  if (blabHashEl) blabHashEl.textContent = generatedBlab;

  // Store to mined records
  const blabRecord = {
    blab: generatedBlab,
    encryptedEmail,
    base64Key,
    minedAt: new Date().toISOString(),
    status: 'unconverted'
  };

  state.minedBlabs.push(blabRecord);
  persistData();
  updateUIBadges();

  // Log output to live Mine terminal feed
  logToTerminal(
    'mine-feed-terminal',
    'MINE',
    `Mined base64 block. Key: <span class="log-highlight">${base64Key.slice(0, 16)}...</span>`
  );
  logToTerminal(
    'mine-feed-terminal',
    'BLAB',
    `New [blab] generated: ${generatedBlab.slice(0, 28)}... [Queue Size: ${state.minedBlabs.filter(b => b.status === 'unconverted').length}]`
  );

  // Check Auto-Convert functionality
  if (state.autoConvert) {
    processSingleBlabConversion(blabRecord);
  }
}

// --- Core Conversion Processing Algorithm ---
/**
 * STANDING REQUIREMENT:
 * Core variables [blab], [miner_identity_email] and [app_user_selected_amount]
 * are used in the correct places in the processing algorithm for correct conversion of mined data.
 * Gives automatic output responses to the feed terminal for each singular processed base64 string.
 */
function processSingleBlabConversion(blabItem) {
  if (!blabItem || blabItem.status === 'converted') return;

  // Core variable extraction per standing requirements
  const blab = blabItem.blab;
  const emailInput = document.getElementById('input-miner-email');
  const amountInput = document.getElementById('input-convert-amount');

  const miner_identity_email = (emailInput && emailInput.value.trim()) || 'miner.protocol@bitminer.io';
  const app_user_selected_amount = parseFloat((amountInput && amountInput.value) || '0.025');

  // Decoding and validating base64 blab
  let decodedBlock = {};
  try {
    decodedBlock = JSON.parse(atob(blab));
  } catch (e) {
    decodedBlock = {
      emailBase64: blabItem.encryptedEmail || 'unknown',
      keyBase64: blabItem.base64Key || 'unknown',
      blockNonce: Date.now()
    };
  }

  // Conversion processing algorithm:
  // Computes checksum multiplier from blab length and amount per blab
  const blabEntropy = (blab.length % 10) * 0.0001;
  const rewardYield = parseFloat((app_user_selected_amount + blabEntropy).toFixed(6));

  // Mark record converted
  blabItem.status = 'converted';
  blabItem.convertedWith = {
    miner_identity_email: miner_identity_email,
    app_user_selected_amount: app_user_selected_amount,
    rewardYield: rewardYield,
    convertedAt: new Date().toISOString()
  };

  state.convertedBlabs.push(blabItem);
  state.totalRewards += rewardYield;

  persistData();
  updateUIBadges();

  // Automatic output responses to the feed terminal for each singular processed final base64 string combination
  logToTerminal(
    'convert-feed-terminal',
    'CONVERT',
    `Processing [blab] => <strong>${blab.slice(0, 22)}...</strong>`
  );
  logToTerminal(
    'convert-feed-terminal',
    'SUCCESS',
    `Target: [miner_identity_email: <span class="log-highlight">${miner_identity_email}</span>] | Rate: [app_user_selected_amount: ${app_user_selected_amount}] => Credited: +${rewardYield} BTC`
  );
}

function processAllPendingConversions() {
  const unconverted = state.minedBlabs.filter(b => b.status === 'unconverted');
  if (unconverted.length === 0) {
    logToTerminal('convert-feed-terminal', 'INFO', 'No pending [blab] combinations in queue to convert.');
    return;
  }

  logToTerminal('convert-feed-terminal', 'INFO', `Batch processing ${unconverted.length} unconverted blab records...`);
  unconverted.forEach(item => {
    processSingleBlabConversion(item);
  });
}

// --- UI Updates ---
function updateUIBadges() {
  const unconverted = state.minedBlabs.filter(b => b.status === 'unconverted');
  const converted = state.convertedBlabs;

  const mineBadge = document.getElementById('mine-count-badge');
  const readyBadge = document.getElementById('ready-convert-badge');
  const totalMinedEl = document.getElementById('metric-total-mined');
  const pendingBlabsEl = document.getElementById('metric-pending-blabs');
  const convertedBlabsEl = document.getElementById('metric-converted-blabs');
  const totalRewardsEl = document.getElementById('metric-total-rewards');
  const pendingBtnCount = document.getElementById('btn-pending-count');

  if (mineBadge) mineBadge.textContent = state.minedBlabs.length;
  if (readyBadge) readyBadge.textContent = unconverted.length;
  if (totalMinedEl) totalMinedEl.textContent = state.minedBlabs.length;
  if (pendingBlabsEl) pendingBlabsEl.textContent = unconverted.length;
  if (convertedBlabsEl) convertedBlabsEl.textContent = converted.length;
  if (totalRewardsEl) totalRewardsEl.textContent = state.totalRewards.toFixed(5) + ' BTC';
  if (pendingBtnCount) pendingBtnCount.textContent = unconverted.length;
}

// --- Navigation Tabs ---
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (!targetTab) return;
      state.activeTab = targetTab;

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
      const targetSection = document.getElementById(`section-${targetTab}`);
      if (targetSection) targetSection.classList.add('active');
    });
  });
}

// --- Mining Controls ---
function setupMiningControls() {
  const toggleMineBtn = document.getElementById('btn-toggle-mine');
  const mineSingularBtn = document.getElementById('btn-mine-singular');
  const clearMinedBtn = document.getElementById('btn-clear-mined');
  const clearTerminalBtn = document.getElementById('btn-clear-terminal');
  const hashrateEl = document.getElementById('metric-hashrate');
  const mineBtnText = document.getElementById('mine-btn-text');

  if (toggleMineBtn) {
    toggleMineBtn.addEventListener('click', () => {
      state.isMining = !state.isMining;
      if (state.isMining) {
        toggleMineBtn.classList.add('btn-active');
        if (mineBtnText) mineBtnText.textContent = 'Halt Mining';
        logToTerminal('mine-feed-terminal', 'INFO', 'Mining engine engaged. Generating Base64 blocks...');
        
        state.miningInterval = setInterval(() => {
          executeMiningCycle();
          state.hashRate = (42.5 + Math.random() * 8.5).toFixed(2);
          if (hashrateEl) hashrateEl.textContent = `${state.hashRate} MH/s`;
        }, 1800);
      } else {
        toggleMineBtn.classList.remove('btn-active');
        if (mineBtnText) mineBtnText.textContent = 'Start Mining';
        clearInterval(state.miningInterval);
        state.miningInterval = null;
        if (hashrateEl) hashrateEl.textContent = '0.00 MH/s';
        logToTerminal('mine-feed-terminal', 'INFO', 'Mining engine paused by operator.');
      }
    });
  }

  if (mineSingularBtn) {
    mineSingularBtn.addEventListener('click', () => {
      executeMiningCycle();
    });
  }

  if (clearMinedBtn) {
    clearMinedBtn.addEventListener('click', () => {
      if (confirm('Clear unconverted blabs from queue?')) {
        state.minedBlabs = state.minedBlabs.filter(b => b.status === 'converted');
        persistData();
        updateUIBadges();
        logToTerminal('mine-feed-terminal', 'INFO', 'Unconverted queue flushed.');
      }
    });
  }

  if (clearTerminalBtn) {
    clearTerminalBtn.addEventListener('click', () => {
      const term = document.getElementById('mine-feed-terminal');
      if (term) term.innerHTML = '';
    });
  }
}

// --- Conversion Controls ---
function setupConversionControls() {
  const processBtn = document.getElementById('btn-process-conversion');
  const exportBtn = document.getElementById('btn-export-json');
  const autoConvertToggle = document.getElementById('toggle-auto-convert');
  const clearConvertTerminalBtn = document.getElementById('btn-clear-convert-terminal');

  if (processBtn) {
    processBtn.addEventListener('click', () => {
      processAllPendingConversions();
    });
  }

  if (autoConvertToggle) {
    autoConvertToggle.addEventListener('change', (e) => {
      state.autoConvert = e.target.checked;
      logToTerminal(
        'convert-feed-terminal',
        'INFO',
        `Auto-Convert mode is now ${state.autoConvert ? 'ENABLED (immediate processing)' : 'DISABLED'}`
      );
      if (state.autoConvert) {
        processAllPendingConversions();
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const exportData = {
        exportTimestamp: new Date().toISOString(),
        totalMined: state.minedBlabs.length,
        totalConverted: state.convertedBlabs.length,
        totalRewardsBTC: state.totalRewards,
        minedBlabs: state.minedBlabs
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitminer_ledger_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      logToTerminal('convert-feed-terminal', 'INFO', 'Exported full JSON ledger successfully.');
    });
  }

  if (clearConvertTerminalBtn) {
    clearConvertTerminalBtn.addEventListener('click', () => {
      const term = document.getElementById('convert-feed-terminal');
      if (term) term.innerHTML = '';
    });
  }
}

// --- PWA Functionality ---
function setupPWA() {
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPwaPrompt = e;
    if (installBtn) {
      installBtn.hidden = false;
      installBtn.addEventListener('click', async () => {
        if (!state.deferredPwaPrompt) return;
        state.deferredPwaPrompt.prompt();
        const choice = await state.deferredPwaPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          installBtn.hidden = true;
        }
        state.deferredPwaPrompt = null;
      });
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.info('Service Worker registration skipped or failed:', err);
      });
    });
  }
}

// --- Initialize Application ---
function initApp() {
  loadStoredData();
  setupNavigation();
  setupMiningControls();
  setupConversionControls();
  setupPWA();
  updateUIBadges();

  // Initial welcome logs
  logToTerminal('mine-feed-terminal', 'INFO', 'BitMiner Core Initialized. Ready for mining operations.');
  logToTerminal('convert-feed-terminal', 'INFO', 'Conversion Terminal Online. Waiting for blab telemetry data.');
}

document.addEventListener('DOMContentLoaded', initApp);
