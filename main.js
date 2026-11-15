import './src/styles.css';
import { BitMinerEngine } from './src/miner.js';

// DOM Element References
const tabMineBtn = document.getElementById('tab-mine-btn');
const tabConvertBtn = document.getElementById('tab-convert-btn');
const viewMine = document.getElementById('view-mine');
const viewConvert = document.getElementById('view-convert');

const btnToggleMine = document.getElementById('btn-toggle-mine');
const btnMineLabel = document.getElementById('btn-mine-label');
const minerStatusPill = document.getElementById('miner-status-pill');
const mineStatusDot = document.getElementById('mine-status-dot');
const autoConvertToggle = document.getElementById('auto-convert-toggle');
const btnManualBurst = document.getElementById('btn-manual-burst');

const teleEmailState = document.getElementById('tele-email-state');
const teleB64Email = document.getElementById('tele-b64-email');
const teleB64Key = document.getElementById('tele-b64-key');
const teleActiveBlab = document.getElementById('tele-active-blab');

const metricHashrate = document.getElementById('metric-hashrate');
const metricBlabsMined = document.getElementById('metric-blabs-mined');
const metricConvertedBalance = document.getElementById('metric-converted-balance');
const metricConvertedFiat = document.getElementById('metric-converted-fiat');
const pendingBlabCount = document.getElementById('pending-blab-count');
const unconvertedBadge = document.getElementById('unconverted-badge');

const minerIdentityEmailInput = document.getElementById('miner_identity_email_input');
const appUserSelectedAmountInput = document.getElementById('app_user_selected_amount_input');
const estimatedConversionYield = document.getElementById('estimated-conversion-yield');
const blabsQueueList = document.getElementById('blabs-queue-list');
const btnProcessConversion = document.getElementById('btn-process-conversion');
const btnSelectAllBlabs = document.getElementById('btn-select-all-blabs');
const btnExportJson = document.getElementById('btn-export-json');
const btnClearQueue = document.getElementById('btn-clear-queue');

const terminalFeed = document.getElementById('terminal-feed');
const btnClearTerminal = document.getElementById('btn-clear-terminal');
const btnAutoscrollToggle = document.getElementById('btn-autoscroll-toggle');
const termConvertedCount = document.getElementById('term-converted-count');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

let autoScroll = true;
let deferredInstallPrompt = null;

// Feed Terminal Logger Helper
function appendTerminalLog(entry) {
  if (!terminalFeed) return;

  const line = document.createElement('div');
  line.className = 'terminal-line';

  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const tagClass = entry.tag === 'MINE' ? 'tag-mine'
    : entry.tag === 'CONV' ? 'tag-convert'
    : entry.tag === 'BLAB' ? 'tag-blab'
    : entry.tag === 'WARN' ? 'tag-warn'
    : 'tag-sys';

  line.innerHTML = `
    <span class="term-timestamp">[${time}]</span>
    <span class="term-tag ${tagClass}">${entry.tag}</span>
    <span class="term-msg">${entry.msg}</span>
  `;

  terminalFeed.appendChild(line);

  // Limit lines to 200 to prevent DOM bloat
  if (terminalFeed.childElementCount > 200) {
    terminalFeed.removeChild(terminalFeed.firstElementChild);
  }

  if (autoScroll) {
    terminalFeed.scrollTop = terminalFeed.scrollHeight;
  }
}

// UI Stats Refresher
function updateStats(stats) {
  if (metricHashrate) {
    metricHashrate.textContent = `${stats.hashrate.toFixed(2)} MH/s`;
  }

  if (metricBlabsMined) {
    metricBlabsMined.textContent = stats.unconvertedCount.toString();
  }

  if (pendingBlabCount) {
    pendingBlabCount.textContent = stats.unconvertedCount.toString();
  }

  if (unconvertedBadge) {
    unconvertedBadge.textContent = stats.unconvertedCount.toString();
  }

  if (metricConvertedBalance) {
    metricConvertedBalance.textContent = `${stats.totalConvertedBtc.toFixed(6)} BTC`;
  }

  if (metricConvertedFiat) {
    // Simulated approximate USD rate at $65,000/BTC
    const usd = (stats.totalConvertedBtc * 65000).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    metricConvertedFiat.textContent = `≈ ${usd}`;
  }

  if (termConvertedCount) {
    termConvertedCount.textContent = stats.convertedCount.toString();
  }

  if (stats.latestRecord) {
    if (teleEmailState) teleEmailState.textContent = 'Active (Base64 Encrypted)';
    if (teleB64Email) teleB64Email.textContent = stats.latestRecord.encryptedEmail;
    if (teleB64Key) teleB64Key.textContent = stats.latestRecord.keyValue;
    if (teleActiveBlab) teleActiveBlab.textContent = stats.latestRecord.blab;
  }

  // Calculate estimated yield
  const selectedAmount = parseFloat(appUserSelectedAmountInput?.value) || 0.0005;
  const estYield = (stats.unconvertedCount * selectedAmount).toFixed(6);
  if (estimatedConversionYield) {
    estimatedConversionYield.textContent = `${estYield} BTC`;
  }

  renderBlabQueue();
}

// Render list of unconverted BLABs in Convert View
function renderBlabQueue() {
  if (!blabsQueueList) return;
  const queue = engine.unconvertedBlabs;

  if (queue.length === 0) {
    blabsQueueList.innerHTML = '<div class="empty-blab-state">No unconverted BLABs in pool. Switch to "Mine" tab to generate tokens.</div>';
    return;
  }

  blabsQueueList.innerHTML = '';
  queue.slice(-15).reverse().forEach((item) => {
    const row = document.createElement('div');
    row.className = 'blab-queue-item selected';
    row.innerHTML = `
      <span class="truncate"><strong>${item.id}</strong>: ${item.blab.substring(0, 28)}...</span>
      <span class="badge-status">READY</span>
    `;
    blabsQueueList.appendChild(row);
  });
}

// Initialize BitMiner Engine
const engine = new BitMinerEngine(appendTerminalLog, updateStats);

// Initial Welcome Log
appendTerminalLog({
  type: 'SYS',
  tag: 'INIT',
  msg: 'BitMiner System Initialized. Dual-node crypto mining &amp; Base64 conversion terminal online.'
});

// Switch Tabs (Mine vs Convert)
function switchTab(targetTab) {
  if (targetTab === 'mine') {
    tabMineBtn.classList.add('active');
    tabConvertBtn.classList.remove('active');
    viewMine.classList.add('active');
    viewConvert.classList.remove('active');
  } else {
    tabConvertBtn.classList.add('active');
    tabMineBtn.classList.remove('active');
    viewConvert.classList.add('active');
    viewMine.classList.remove('active');
  }
}

tabMineBtn?.addEventListener('click', () => switchTab('mine'));
tabConvertBtn?.addEventListener('click', () => switchTab('convert'));

// Toggle Mining Execution
btnToggleMine?.addEventListener('click', () => {
  const activeEmail = minerIdentityEmailInput.value.trim() || 'miner.core@bitminer.crypto';
  const selectedAmount = parseFloat(appUserSelectedAmountInput.value) || 0.0005;

  if (!engine.isMining) {
    engine.startMining(activeEmail, selectedAmount);
    btnToggleMine.classList.add('active');
    btnMineLabel.textContent = 'Pause Mining';
    minerStatusPill.textContent = 'MINING ACTIVE';
    minerStatusPill.className = 'status-badge mining';
    document.querySelector('.mining-status-display')?.classList.add('mining-active');
  } else {
    engine.stopMining();
    btnToggleMine.classList.remove('active');
    btnMineLabel.textContent = 'Start Mining';
    minerStatusPill.textContent = 'IDLE';
    minerStatusPill.className = 'status-badge';
    document.querySelector('.mining-status-display')?.classList.remove('mining-active');
  }
});

// Manual Quick Burst Mining
btnManualBurst?.addEventListener('click', () => {
  const activeEmail = minerIdentityEmailInput.value.trim() || 'miner.core@bitminer.crypto';
  const selectedAmount = parseFloat(appUserSelectedAmountInput.value) || 0.0005;
  engine.burstMining(5, activeEmail, selectedAmount);
});

// Auto-Convert Toggle
autoConvertToggle?.addEventListener('change', (e) => {
  engine.autoConvertEnabled = e.target.checked;
  appendTerminalLog({
    type: 'SYS',
    tag: 'CFG',
    msg: `Auto-convert mode: <strong>${engine.autoConvertEnabled ? 'ENABLED' : 'DISABLED'}</strong>`
  });
});

// Amount Preset Buttons
document.querySelectorAll('.amount-presets .btn-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.amount-presets .btn-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const amt = chip.getAttribute('data-amt');
    if (appUserSelectedAmountInput) {
      appUserSelectedAmountInput.value = amt;
      updateStats({
        isMining: engine.isMining,
        hashrate: engine.hashrate,
        unconvertedCount: engine.unconvertedBlabs.length,
        convertedCount: engine.convertedHistory.length,
        totalConvertedBtc: engine.totalConvertedBtc
      });
    }
  });
});

appUserSelectedAmountInput?.addEventListener('input', () => {
  updateStats({
    isMining: engine.isMining,
    hashrate: engine.hashrate,
    unconvertedCount: engine.unconvertedBlabs.length,
    convertedCount: engine.convertedHistory.length,
    totalConvertedBtc: engine.totalConvertedBtc
  });
});

// Manual Convert Button
btnProcessConversion?.addEventListener('click', () => {
  const miner_identity_email = minerIdentityEmailInput.value.trim();
  const app_user_selected_amount = parseFloat(appUserSelectedAmountInput.value);

  if (!miner_identity_email) {
    alert('Please provide a valid Miner Identity Email [miner_identity_email].');
    minerIdentityEmailInput.focus();
    return;
  }

  if (isNaN(app_user_selected_amount) || app_user_selected_amount <= 0) {
    alert('Please enter a valid conversion amount [app_user_selected_amount].');
    appUserSelectedAmountInput.focus();
    return;
  }

  engine.processQueueConversion(miner_identity_email, app_user_selected_amount);
});

// Select All Blabs shortcut
btnSelectAllBlabs?.addEventListener('click', () => {
  appendTerminalLog({
    type: 'SYS',
    tag: 'QUEUE',
    msg: `All ${engine.unconvertedBlabs.length} pending [blab] records selected for conversion.`
  });
});

// Export JSON and Clear Queue
btnExportJson?.addEventListener('click', () => engine.exportMinedJson());
btnClearQueue?.addEventListener('click', () => {
  if (confirm('Clear all unconverted [blab] tokens from the queue?')) {
    engine.clearQueue();
  }
});

// Terminal Controls
btnClearTerminal?.addEventListener('click', () => {
  terminalFeed.innerHTML = '';
  appendTerminalLog({
    type: 'SYS',
    tag: 'SYS',
    msg: 'Terminal output cleared.'
  });
});

btnAutoscrollToggle?.addEventListener('click', () => {
  autoScroll = !autoScroll;
  btnAutoscrollToggle.classList.toggle('active', autoScroll);
  appendTerminalLog({
    type: 'SYS',
    tag: 'SYS',
    msg: `Terminal autoscroll set to ${autoScroll ? 'ON' : 'OFF'}`
  });
});

// PWA Functionality & Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => {
        console.log('BitMiner SW registered with scope:', reg.scope);
      },
      (err) => {
        console.log('BitMiner SW registration failed:', err);
      }
    );
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (pwaInstallBtn) {
    pwaInstallBtn.hidden = false;
  }
});

pwaInstallBtn?.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    appendTerminalLog({
      type: 'SYS',
      tag: 'PWA',
      msg: `PWA install prompt outcome: ${outcome}`
    });
    deferredInstallPrompt = null;
    pwaInstallBtn.hidden = true;
  }
});

// Initial stats sync
engine.notifyStats();
