/**
 * BitMiner Application Engine
 * Core logic for base64 miner identity generation, base64 blab key generation,
 * and blab conversion algorithm.
 */

// State Management
const state = {
  isMining: false,
  miner_identity_email: '', // Core Variable
  app_user_selected_amount: 0.025, // Core Variable
  blabs: [], // Array of { id, blab, miner_identity_email, timestamp, converted, convertedAmount }
  autoConvert: true,
  miningIntervalId: null,
  totalConvertedValue: 0
};

// Helper: Generate Base64 Encrypted Email
function generateBase64Email() {
  const randomUser = 'miner_' + Math.random().toString(36).substring(2, 8);
  const domains = ['bitminer.net', 'cryptonode.io', 'hashpool.org', 'blockmesh.dev'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const rawEmail = `${randomUser}@${domain}`;
  return btoa(rawEmail);
}

// Helper: Generate Base64 Blab Key
function generateBase64BlabKey() {
  const prefix = 'BLAB';
  const randomHash = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = Date.now();
  const rawBlab = `${prefix}-${randomHash}-${timestamp}`;
  return btoa(rawBlab);
}

// Core Algorithm: Process Conversion for a singular blab
function processBlabConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || !miner_identity_email) return null;
  
  // Conversion processing algorithm multiplying length modulus factor with user selected amount
  const blabLengthFactor = (atob(blab).length % 7) + 1;
  const calculatedYield = (parseFloat(app_user_selected_amount) * (blabLengthFactor * 0.1 + 0.9)).toFixed(6);
  
  const timestamp = new Date().toLocaleTimeString();
  let decodedEmail = 'unknown';
  try {
    decodedEmail = atob(miner_identity_email);
  } catch (e) {
    decodedEmail = miner_identity_email;
  }

  const logOutput = `[CONVERTED] Timestamp: ${timestamp} | blab: "${blab}" | miner_identity_email: "${miner_identity_email}" (${decodedEmail}) | app_user_selected_amount: ${app_user_selected_amount} -> Yield: +${calculatedYield} BTC`;
  
  return {
    yieldAmount: parseFloat(calculatedYield),
    logMessage: logOutput
  };
}

// Log output response to feed terminal
function appendTerminalLog(message, type = 'info') {
  const terminal = document.getElementById('feed-terminal');
  if (!terminal) return;
  
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = message;
  terminal.appendChild(line);
  
  // Auto scroll terminal
  terminal.scrollTop = terminal.scrollHeight;
}

// Render Mined Table & Metrics UI
function updateUI() {
  // Metrics
  document.getElementById('metric-total-blabs').textContent = state.blabs.length;
  
  const pendingCount = state.blabs.filter(b => !b.converted).length;
  document.getElementById('metric-pending-blabs').textContent = pendingCount;
  
  const latestBlabItem = state.blabs[0];
  document.getElementById('metric-latest-blab').textContent = latestBlabItem ? latestBlabItem.blab : 'None';
  
  const convertedCount = state.blabs.filter(b => b.converted).length;
  document.getElementById('metric-converted-count').textContent = convertedCount;
  document.getElementById('metric-total-value').textContent = state.totalConvertedValue.toFixed(6) + ' BTC';
  document.getElementById('metric-current-rate').textContent = `${state.app_user_selected_amount} BTC/blab`;
  
  // Table render
  const tbody = document.getElementById('mined-blabs-tbody');
  if (!tbody) return;
  
  if (state.blabs.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">No blabs mined yet. Press "Start Mining" to begin.</td></tr>`;
    return;
  }
  
  const rowsHTML = state.blabs.slice(0, 15).map(item => `
    <tr>
      <td>${item.timestamp}</td>
      <td class="code-font text-truncate" style="max-width: 140px;" title="${item.blab}">${item.blab}</td>
      <td class="code-font text-truncate" style="max-width: 140px;" title="${item.miner_identity_email}">${item.miner_identity_email}</td>
      <td>
        ${item.converted 
          ? `<span class="badge badge-success">+${item.convertedAmount} BTC</span>` 
          : `<span class="badge badge-pending">Pending</span>`}
      </td>
    </tr>
  `).join('');
  
  tbody.innerHTML = rowsHTML;
}

// Perform singular Mining Step
function mineStep() {
  // Core Variable: blab generated
  const blab = generateBase64BlabKey();
  const timestamp = new Date().toLocaleTimeString();
  
  const newEntry = {
    id: Date.now() + Math.random(),
    blab: blab,
    miner_identity_email: state.miner_identity_email,
    timestamp: timestamp,
    converted: false,
    convertedAmount: 0
  };
  
  state.blabs.unshift(newEntry);
  appendTerminalLog(`[MINED] Blab Key: ${blab} mined by ${state.miner_identity_email}`, 'info');
  
  // Auto convert if enabled
  if (state.autoConvert) {
    convertSingularBlab(newEntry);
  }
  
  updateUI();
}

// Convert a specific blab entry using the core variables algorithm
function convertSingularBlab(entry) {
  if (entry.converted) return;
  
  const result = processBlabConversion(entry.blab, entry.miner_identity_email, state.app_user_selected_amount);
  if (result) {
    entry.converted = true;
    entry.convertedAmount = result.yieldAmount;
    state.totalConvertedValue += result.yieldAmount;
    appendTerminalLog(result.logMessage, 'success');
  }
}

// Batch process all pending unconverted blabs
function convertAllPending() {
  const pending = state.blabs.filter(b => !b.converted);
  if (pending.length === 0) {
    appendTerminalLog('[SYSTEM] No pending blabs to convert.', 'warn');
    return;
  }
  
  appendTerminalLog(`[PROCESSING] Batch converting ${pending.length} pending blabs...`, 'info');
  pending.forEach(entry => {
    // Ensure updated UI parameters are passed
    entry.miner_identity_email = state.miner_identity_email;
    convertSingularBlab(entry);
  });
  updateUI();
}

// Initialize & Wire DOM Listeners
function init() {
  // 1. Initial Identity
  state.miner_identity_email = generateBase64Email();
  const identityInput = document.getElementById('current-identity-display');
  const identityInputForm = document.getElementById('miner_identity_email_input');
  const decodedHint = document.getElementById('decoded-identity-hint');
  
  const refreshIdentityUI = () => {
    if (identityInput) identityInput.value = state.miner_identity_email;
    if (identityInputForm) identityInputForm.value = state.miner_identity_email;
    if (decodedHint) decodedHint.textContent = `Decoded: ${atob(state.miner_identity_email)}`;
  };
  refreshIdentityUI();

  // 2. Regenerate Identity Event
  document.getElementById('btn-regen-identity')?.addEventListener('click', () => {
    state.miner_identity_email = generateBase64Email();
    refreshIdentityUI();
    appendTerminalLog(`[IDENTITY] Regenerated active miner identity: ${state.miner_identity_email}`, 'info');
  });

  // 3. Tab Switching
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetTab)?.classList.add('active');
    });
  });

  // 4. Toggle Mining Button
  const toggleMiningBtn = document.getElementById('btn-toggle-mining');
  const statusPill = document.getElementById('system-status');
  const hashrateSelect = document.getElementById('hashrate-select');
  
  const startMining = () => {
    state.isMining = true;
    toggleMiningBtn.textContent = '⏹ Stop Mining';
    toggleMiningBtn.classList.replace('btn-primary', 'btn-outline');
    statusPill.textContent = 'MINING';
    statusPill.classList.add('active');
    
    const speed = parseInt(hashrateSelect.value) || 1000;
    state.miningIntervalId = setInterval(mineStep, speed);
    appendTerminalLog('[SYSTEM] Mining process started.', 'info');
  };
  
  const stopMining = () => {
    state.isMining = false;
    toggleMiningBtn.textContent = '▶ Start Mining';
    toggleMiningBtn.classList.replace('btn-outline', 'btn-primary');
    statusPill.textContent = 'IDLE';
    statusPill.classList.remove('active');
    
    clearInterval(state.miningIntervalId);
    appendTerminalLog('[SYSTEM] Mining process stopped.', 'warn');
  };

  toggleMiningBtn?.addEventListener('click', () => {
    if (state.isMining) stopMining();
    else startMining();
  });

  // Hashrate change during mining
  hashrateSelect?.addEventListener('change', () => {
    if (state.isMining) {
      stopMining();
      startMining();
    }
  });

  // 5. Conversion Controls
  const amountInput = document.getElementById('app_user_selected_amount_input');
  amountInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      state.app_user_selected_amount = val;
      updateUI();
    }
  });

  identityInputForm?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val.length > 0) {
      state.miner_identity_email = val;
      if (identityInput) identityInput.value = val;
      try {
        if (decodedHint) decodedHint.textContent = `Decoded: ${atob(val)}`;
      } catch (err) {
        if (decodedHint) decodedHint.textContent = `Decoded: (Invalid base64)`;
      }
    }
  });

  const autoConvertToggle = document.getElementById('auto-convert-toggle');
  autoConvertToggle?.addEventListener('change', (e) => {
    state.autoConvert = e.target.checked;
    appendTerminalLog(`[CONFIG] Auto-convert feature ${state.autoConvert ? 'ENABLED' : 'DISABLED'}`, 'info');
  });

  document.getElementById('btn-process-manual-convert')?.addEventListener('click', () => {
    convertAllPending();
  });

  document.getElementById('btn-clear-terminal')?.addEventListener('click', () => {
    const terminal = document.getElementById('feed-terminal');
    if (terminal) terminal.innerHTML = '<div class="log-line info">[SYSTEM] Feed cleared.</div>';
  });

  // PWA Support
  let deferredPrompt;
  const pwaBtn = document.getElementById('pwa-install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaBtn?.classList.remove('hidden');
  });

  pwaBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        pwaBtn.classList.add('hidden');
      }
      deferredPrompt = null;
    }
  });

  // Initial UI Render
  updateUI();
  console.log('BitMiner application initialized with core processing variables [blab], [miner_identity_email], [app_user_selected_amount]');
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration skipped:', err);
    });
  });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
