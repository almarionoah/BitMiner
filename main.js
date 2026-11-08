/**
 * BitMiner Engine & Blab Converter
 * Primary implementation following Engineering Work Assets
 */

// State Management
const state = {
  miningActive: false,
  mineTimer: null,
  mineInterval: 3000,
  globalRate: 45.50,
  autoConvert: false,
  blabs: [],
  stats: {
    hashrate: 0,
    totalMined: 0,
    totalConverted: 0,
    convertedUsd: 0
  }
};

PWA Installation Prompt Holder
let deferredPrompt = null;

// DOM Elements
const tabMine = document.getElementById('tabMine');
const tabConvert = document.getElementById('tabConvert');
const mineTabContent = document.getElementById('mine-tab');
const convertTabContent = document.getElementById('convert-tab');
const toggleMiningBtn = document.getElementById('toggleMiningBtn');
const mineSpeedSelect = document.getElementById('mineSpeed');
const liveStatus = document.getElementById('liveStatus');
const feedTerminal = document.getElementById('feedTerminal');
const clearTerminalBtn = document.getElementById('clearTerminalBtn');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');

// Stat displays
const hashrateVal = document.getElementById('hashrateVal');
const blabCountVal = document.getElementById('blabCountVal');
const unconvertedVal = document.getElementById('unconvertedVal');
const convertedBalanceVal = document.getElementById('convertedBalanceVal');

// Convert Elements
const globalRateInput = document.getElementById('globalRateInput');
const autoConvertToggle = document.getElementById('autoConvertToggle');
const convertAllBtn = document.getElementById('convertAllBtn');
const blabsTableBody = document.getElementById('blabsTableBody');
const manualConvertForm = document.getElementById('manualConvertForm');
const manualEmailInput = document.getElementById('manualEmailInput');
const manualAmountInput = document.getElementById('manualAmountInput');

// Helper Utilities
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64Str) {
  try {
    return decodeURIComponent(escape(atob(b64Str)));
  } catch (e) {
    return b64Str;
  }
}

function generateRandomKey(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return toBase64(result);
}

function generateEmail() {
  const domains = ['bitminer.node', 'hashcore.io', 'crypto.net', 'chainlink.org'];
  const randId = Math.floor(10000 + Math.random() * 90000);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `miner_${randId}@${domain}`;
}

function getTimeString() {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

// Terminal Logging
function logToTerminal(tag, message) {
  const line = document.createElement('div');
  line.className = 'term-line';
  line.innerHTML = `
    <span class="term-time">[${getTimeString()}]</span>
    <span class="term-tag ${tag}">[${tag}]</span>
    <span class="term-msg">${message}</span>
  `;
  feedTerminal.appendChild(line);
  feedTerminal.scrollTop = feedTerminal.scrollHeight;
}

// Tab Navigation
function switchTab(targetTabId) {
  if (targetTabId === 'mine-tab') {
    tabMine.classList.add('active');
    tabConvert.classList.remove('active');
    mineTabContent.classList.add('active');
    convertTabContent.classList.remove('active');
  } else {
    tabConvert.classList.add('active');
    tabMine.classList.remove('active');
    convertTabContent.classList.add('active');
    mineTabContent.classList.remove('active');
  }
}

tabMine.addEventListener('click', () => switchTab('mine-tab'));
tabConvert.addEventListener('click', () => switchTab('convert-tab'));

// Mine Logic
function createBlabRecord(rawEmail, defaultAmount = 1.0) {
  const emailB64 = toBase64(rawEmail);
  const keyB64 = generateRandomKey(16);
  const blabHash = toBase64(`${emailB64}:${keyB64}`);
  
  const record = {
    id: 'blab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toLocaleTimeString(),
    emailRaw: rawEmail,
    emailB64,
    keyB64,
    blabHash,
    amount: defaultAmount,
    converted: false,
    convertedUsd: 0
  };

  state.blabs.unshift(record);
  state.stats.totalMined++;

  logToTerminal('MINE', `New block candidate found: Email [${rawEmail}]`);
  logToTerminal('BLAB', `Encrypted Email (Base64): ${emailB64}`);
  logToTerminal('BLAB', `Generated Key (Base64): ${keyB64}`);
  logToTerminal('BLAB', `Final Blab Payload: ${blabHash}`);

  if (state.autoConvert) {
    processBlabConversion(record);
  }

  updateUI();
  return record;
}

function mineStep() {
  const email = generateEmail();
  state.stats.hashrate = (12.4 + Math.random() * 4.2).toFixed(2);
  createBlabRecord(email);
}

function toggleMining() {
  state.miningActive = !state.miningActive;
  if (state.miningActive) {
    toggleMiningBtn.innerHTML = '🛑 Stop Mining Engine';
    toggleMiningBtn.classList.remove('btn-primary');
    toggleMiningBtn.classList.add('btn-outline');
    liveStatus.innerHTML = '<span class="dot active"></span> Mining Active';
    logToTerminal('SYS', `Mining engine STARTED at interval ${state.mineInterval}ms`);
    mineStep();
    state.mineTimer = setInterval(mineStep, state.mineInterval);
  } else {
    toggleMiningBtn.innerHTML = '⚡ Start Mining Engine';
    toggleMiningBtn.classList.remove('btn-outline');
    toggleMiningBtn.classList.add('btn-primary');
    liveStatus.innerHTML = '<span class="dot inactive"></span> Idle';
    state.stats.hashrate = 0;
    clearInterval(state.mineTimer);
    logToTerminal('SYS', 'Mining engine STOPPED.');
  }
  updateUI();
}

toggleMiningBtn.addEventListener('click', toggleMining);
mineSpeedSelect.addEventListener('change', (e) => {
  state.mineInterval = parseInt(e.target.value, 10);
  if (state.miningActive) {
    clearInterval(state.mineTimer);
    state.mineTimer = setInterval(mineStep, state.mineInterval);
    logToTerminal('SYS', `Updated mining speed interval to ${state.mineInterval}ms`);
  }
});

// Conversion Processing
function processBlabConversion(blabRecord, customAmount = null) {
  if (blabRecord.converted) return;
  
  const amountToUse = customAmount !== null ? parseFloat(customAmount) : parseFloat(blabRecord.amount);
  blabRecord.amount = amountToUse;
  
  const usdPayout = (amountToUse * state.globalRate).toFixed(2);
  blabRecord.converted = true;
  blabRecord.convertedUsd = parseFloat(usdPayout);
  
  state.stats.totalConverted++;
  state.stats.convertedUsd += parseFloat(usdPayout);

  logToTerminal(
    'CONVERT',
    `Processed Blab [${blabRecord.blabHash.substring(0, 16)}...] -> Amount: ${amountToUse} BLAB | Rate: $${state.globalRate} | Payout: $${usdPayout} USD`
  );
  updateUI();
}

function convertAllPending() {
  const pending = state.blabs.filter(b => !b.converted);
  if (pending.length === 0) {
    logToTerminal('SYS', 'No pending blabs available for conversion.');
    return;
  }
  logToTerminal('SYS', `Batch processing ${pending.length} pending blab conversions...`);
  pending.forEach(blab => processBlabConversion(blab));
}

convertAllBtn.addEventListener('click', convertAllPending);

globalRateInput.addEventListener('change', (e) => {
  const val = parseFloat(e.target.value);
  if (!isNaN(val) && val > 0) {
    state.globalRate = val;
    logToTerminal('SYS', `Conversion exchange rate updated to $${state.globalRate}/BLAB`);
  }
});

autoConvertToggle.addEventListener('change', (e) => {
  state.autoConvert = e.target.checked;
  logToTerminal('SYS', `Auto-convert mode set to: ${state.autoConvert ? 'ENABLED' : 'DISABLED'}`);
});

manualConvertForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = manualEmailInput.value.trim();
  const amount = parseFloat(manualAmountInput.value);
  if (email && !isNaN(amount) && amount > 0) {
    logToTerminal('SYS', `Manual blab conversion initiated for email: ${email}`);
    const record = createBlabRecord(email, amount);
    processBlabConversion(record, amount);
    manualEmailInput.value = '';
  }
});

clearTerminalBtn.addEventListener('click', () => {
  feedTerminal.innerHTML = '';
  logToTerminal('SYS', 'Terminal log cleared.');
});

// Render UI & Table Updates
function updateUI() {
  hashrateVal.textContent = state.miningActive ? `${state.stats.hashrate} MH/s` : '0.00 MH/s';
  blabCountVal.textContent = state.stats.totalMined;
  
  const pendingCount = state.blabs.filter(b => !b.converted).length;
  unconvertedVal.textContent = `${pendingCount} BLAB`;
  convertedBalanceVal.textContent = `$${state.stats.convertedUsd.toFixed(2)} USD`;

  renderBlabsTable();
}

function renderBlabsTable() {
  if (state.blabs.length === 0) {
    blabsTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No blabs generated yet. Start mining or process a manual conversion.</td>
      </tr>
    `;
    return;
  }

  blabsTableBody.innerHTML = state.blabs.map(blab => `
    <tr>
      <td>${blab.timestamp}</td>
      <td class="code-cell" title="${blab.emailRaw}">${blab.emailB64}</td>
      <td class="code-cell">${blab.keyB64}</td>
      <td class="code-cell">${blab.blabHash}</td>
      <td>
        ${blab.converted 
          ? `<span>${blab.amount} BLAB</span>` 
          : `<input type="number" class="number-input table-amount-input" value="${blab.amount}" step="0.1" min="0.1" data-blab-id="${blab.id}">`
        }
      </td>
      <td>
        ${blab.converted
          ? `<span class="badge badge-converted">✓ Paid $${blab.convertedUsd}</span>`
          : `<button class="btn btn-small btn-accent convert-single-btn" data-blab-id="${blab.id}">Convert</button>`
        }
      </td>
    </tr>
  `).join('');

  // Wire dynamic table inputs and buttons
  blabsTableBody.querySelectorAll('.table-amount-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const blabId = e.target.getAttribute('data-blab-id');
      const blab = state.blabs.find(b => b.id === blabId);
      if (blab) {
        blab.amount = parseFloat(e.target.value) || 1.0;
      }
    });
  });

  blabsTableBody.querySelectorAll('.convert-single-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const blabId = e.target.getAttribute('data-blab-id');
      const blab = state.blabs.find(b => b.id === blabId);
      if (blab) {
        processBlabConversion(blab);
      }
    });
  });
}

// PWA Functionality
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  pwaInstallBtn.classList.remove('hidden');
});

pwaInstallBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    logToTerminal('SYS', `PWA install prompt outcome: ${outcome}`);
    deferredPrompt = null;
    pwaInstallBtn.classList.add('hidden');
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => logToTerminal('SYS', `ServiceWorker registered with scope: ${reg.scope}`))
      .catch(err => logToTerminal('ERR', `ServiceWorker registration failed: ${err.message}`));
  });
}

// Initial Log
logToTerminal('SYS', 'BitMiner Enterprise Engine v1.0.0 Initialized.');
logToTerminal('SYS', 'Ready for base64 email mining & blab conversion processing.');
updateUI();
