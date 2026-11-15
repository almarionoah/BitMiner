import './style.css';
import { generateMinedBlab, processConversion } from './src/converter.js';

// State Store
const state = {
  activeTab: 'mine', // 'mine' | 'convert'
  isMining: false,
  miningInterval: null,
  miningSpeedMs: 1400,
  autoConvert: true,
  miner_identity_email: localStorage.getItem('bitminer_identity_email') || 'miner_01@bitminer.network',
  app_user_selected_amount: localStorage.getItem('bitminer_user_amount') || '0.002500',
  blabs: JSON.parse(localStorage.getItem('bitminer_blabs') || '[]'),
  logs: [
    { time: new Date().toLocaleTimeString(), text: 'BitMiner system initialized. Linear gradient protocol active.', type: 'info' },
    { time: new Date().toLocaleTimeString(), text: 'Crypto core ready. Select "Mine" or "Convert" to operate.', type: 'success' }
  ]
};

function saveState() {
  localStorage.setItem('bitminer_identity_email', state.miner_identity_email);
  localStorage.setItem('bitminer_user_amount', state.app_user_selected_amount);
  localStorage.setItem('bitminer_blabs', JSON.stringify(state.blabs));
}

function addLog(text, type = 'info') {
  const log = { time: new Date().toLocaleTimeString(), text, type };
  state.logs.unshift(log);
  if (state.logs.length > 80) state.logs.pop();
  renderLogs();
}

function renderLogs() {
  const feedEl = document.getElementById('terminal-feed');
  if (!feedEl) return;
  feedEl.innerHTML = state.logs
    .map(
      l => `
      <div class="log-entry">
        <span class="log-time">[${l.time}]</span>
        <span class="log-${l.type}">${escapeHtml(l.text)}</span>
      </div>
    `
    )
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Mining cycle
function triggerMiningStep() {
  const newBlabObj = generateMinedBlab();
  state.blabs.unshift(newBlabObj);
  
  addLog(`[MINE] Generated Base64 Email: ${newBlabObj.base64Email.slice(0, 16)}... (${newBlabObj.plainEmail})`, 'info');
  addLog(`[MINE] Created [blab]: ${newBlabObj.blab.slice(0, 32)}...`, 'blab');

  // Check auto-convert
  if (state.autoConvert) {
    executeSingleBlabConversion(newBlabObj.id);
  } else {
    saveState();
    updateStats();
    renderBlabList();
  }
}

function executeSingleBlabConversion(blabId) {
  const blabObj = state.blabs.find(b => b.id === blabId);
  if (!blabObj || blabObj.converted) return;

  try {
    // Core variable contract usage
    const blab = blabObj.blab;
    const miner_identity_email = state.miner_identity_email;
    const app_user_selected_amount = state.app_user_selected_amount;

    const result = processConversion(blab, miner_identity_email, app_user_selected_amount);
    
    blabObj.converted = true;
    blabObj.convertedAmount = result.app_user_selected_amount;
    blabObj.minerEmail = result.miner_identity_email;
    blabObj.txHash = result.txHash;

    addLog(`[CONVERT] Automatic Output Response: ${result.message} | Tx: ${result.txHash.slice(0, 14)}...`, 'success');
    saveState();
    updateStats();
    renderBlabList();
  } catch (err) {
    addLog(`[CONVERT ERROR] Failed processing blab: ${err.message}`, 'warning');
  }
}

function toggleMining() {
  state.isMining = !state.isMining;
  const mineBtn = document.getElementById('btn-toggle-mine');

  if (state.isMining) {
    addLog('Mining sequence started. Auto-generating Base64 credentials...', 'info');
    triggerMiningStep();
    state.miningInterval = setInterval(triggerMiningStep, state.miningSpeedMs);
    if (mineBtn) {
      mineBtn.textContent = 'Stop Mining Rig';
      mineBtn.classList.add('active-mining');
    }
  } else {
    clearInterval(state.miningInterval);
    addLog('Mining rig paused.', 'warning');
    if (mineBtn) {
      mineBtn.textContent = 'Start Auto Mine';
      mineBtn.classList.remove('active-mining');
    }
  }
}

function convertAllPending() {
  const pending = state.blabs.filter(b => !b.converted);
  if (pending.length === 0) {
    addLog('[CONVERT] No uncommitted blabs to process.', 'warning');
    return;
  }
  addLog(`[CONVERT] Batch processing ${pending.length} pending blab(s)...`, 'info');
  pending.forEach(b => {
    executeSingleBlabConversion(b.id);
  });
}

function updateStats() {
  const totalMined = state.blabs.length;
  const totalConverted = state.blabs.filter(b => b.converted).length;
  const totalAmount = state.blabs
    .filter(b => b.converted)
    .reduce((sum, b) => sum + (b.convertedAmount || 0), 0);

  const elMined = document.getElementById('stat-total-mined');
  const elConverted = document.getElementById('stat-total-converted');
  const elValue = document.getElementById('stat-total-val');

  if (elMined) elMined.textContent = totalMined;
  if (elConverted) elConverted.textContent = totalConverted;
  if (elValue) elValue.textContent = totalAmount.toFixed(6) + ' BTC';
}

function renderBlabList() {
  const listEl = document.getElementById('blab-items-container');
  if (!listEl) return;

  if (state.blabs.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No base64 blabs generated yet. Click "Start Auto Mine" above.</div>';
    return;
  }

  listEl.innerHTML = state.blabs.slice(0, 20).map(b => `
    <div class="blab-item">
      <div>
        <div class="blab-code" title="${escapeHtml(b.blab)}">${escapeHtml(b.blab)}</div>
        <div class="blab-meta">${b.plainEmail} &bull; ${new Date(b.timestamp).toLocaleTimeString()}</div>
      </div>
      <div>
        ${b.converted 
          ? `<span class="card-badge badge-emerald">CONVERTED (${b.convertedAmount.toFixed(4)} BTC)</span>`
          : `<button class="btn-sm" data-id="${b.id}">Convert</button>`
        }
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.btn-sm').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      executeSingleBlabConversion(id);
    });
  });
}

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration error:', err);
    });
  }

  let deferredPrompt;
  const installBtn = document.getElementById('btn-pwa-install');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="app-header">
      <div class="logo-wrapper">
        <div class="logo-icon">B</div>
        <div>
          <div class="logo-text">BitMiner Core</div>
          <div class="logo-tagline">Base64 Node & Conversion Network</div>
        </div>
      </div>

      <nav class="nav-tabs">
        <button class="nav-tab ${state.activeTab === 'mine' ? 'active' : ''}" id="tab-mine">
          <span>⛏️</span> Mine
        </button>
        <button class="nav-tab ${state.activeTab === 'convert' ? 'active' : ''}" id="tab-convert">
          <span>⚡</span> Convert
        </button>
      </nav>

      <div class="header-actions">
        <button id="btn-pwa-install" class="pwa-btn">📲 Install App</button>
        <button id="btn-export-json" class="btn-secondary" style="padding: 0.45rem 0.8rem; font-size: 0.8rem; border-radius: 8px; cursor: pointer;">💾 Export JSON</button>
      </div>
    </header>

    <main class="main-container">
      <!-- Mining Section Card -->
      <section class="card" id="section-mine" style="display: ${state.activeTab === 'mine' || window.innerWidth > 980 ? 'block' : 'none'};">
        <div class="card-header">
          <h2 class="card-title">⛏️ Base64 Rig Miner</h2>
          <span class="card-badge badge-emerald">ACTIVE RIG</span>
        </div>

        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-label">Mined Blabs</div>
            <div class="stat-value" id="stat-total-mined">0</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Converted</div>
            <div class="stat-value" id="stat-total-converted">0</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Accumulated</div>
            <div class="stat-value" id="stat-total-val">0.000000 BTC</div>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Generates valid base64-encrypted email identities paired with cryptographic key values into formatted <strong>[blab]</strong> string combinations.
        </p>

        <div class="btn-group">
          <button id="btn-toggle-mine" class="btn btn-primary">
            Start Auto Mine
          </button>
          <button id="btn-manual-step" class="btn btn-secondary">
            +1 Mine Blab
          </button>
        </div>

        <div style="margin-top: 1.25rem;">
          <div class="form-label" style="margin-bottom: 0.5rem;">Mined [blab] Buffer Stream</div>
          <div class="blab-table-container" id="blab-items-container">
            <div class="empty-state">Loading buffer...</div>
          </div>
        </div>
      </section>

      <!-- Conversion Section Card -->
      <section class="card" id="section-convert" style="display: ${state.activeTab === 'convert' || window.innerWidth > 980 ? 'block' : 'none'};">
        <div class="card-header">
          <h2 class="card-title">⚡ Conversion Processing</h2>
          <span class="card-badge badge-amber">ALGORITHM READY</span>
        </div>

        <div class="toggle-container">
          <div>
            <div class="toggle-label">Auto-Convert Mined Blabs</div>
            <div class="toggle-sub">Processes each generated [blab] automatically into wallet payout</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="input-auto-convert" ${state.autoConvert ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-miner-email">Target Miner Identity Email [miner_identity_email]</label>
          <input 
            type="email" 
            id="input-miner-email" 
            class="form-input" 
            value="${escapeHtml(state.miner_identity_email)}"
            placeholder="e.g. miner_payout@bitminer.network"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="input-amount">Conversion Amount Per Blab [app_user_selected_amount]</label>
          <input 
            type="number" 
            step="0.000100" 
            min="0.000001" 
            id="input-amount" 
            class="form-input" 
            value="${state.app_user_selected_amount}"
            placeholder="0.002500"
          />
        </div>

        <div class="btn-group">
          <button id="btn-batch-convert" class="btn btn-convert">
            Convert All Unprocessed
          </button>
          <button id="btn-clear-blabs" class="btn btn-secondary">
            Clear Data
          </button>
        </div>
      </section>

      <!-- Automatic Feed Terminal Output -->
      <section class="terminal-wrapper">
        <div class="terminal-header">
          <div class="terminal-dots">
            <div class="terminal-dot dot-red"></div>
            <div class="terminal-dot dot-yellow"></div>
            <div class="terminal-dot dot-green"></div>
          </div>
          <div class="terminal-title">FEED TERMINAL &bull; LIVE EXECUTION LOG</div>
          <button id="btn-clear-logs" style="background: transparent; border: none; color: #64748b; font-size: 0.75rem; cursor: pointer;">Clear Feed</button>
        </div>
        <div class="terminal-feed" id="terminal-feed"></div>
      </section>
    </main>

    <footer class="app-footer">
      BitMiner Autonomous Mining &amp; Conversion Protocol &bull; PWA Enabled &bull; Secure Base64 Ledger
    </footer>
  `;

  // Wire event handlers
  document.getElementById('tab-mine').addEventListener('click', () => switchTab('mine'));
  document.getElementById('tab-convert').addEventListener('click', () => switchTab('convert'));

  document.getElementById('btn-toggle-mine').addEventListener('click', toggleMining);
  document.getElementById('btn-manual-step').addEventListener('click', triggerMiningStep);
  document.getElementById('btn-batch-convert').addEventListener('click', convertAllPending);
  
  document.getElementById('btn-clear-blabs').addEventListener('click', () => {
    if (confirm('Clear all mined blabs data?')) {
      state.blabs = [];
      saveState();
      updateStats();
      renderBlabList();
      addLog('[STORAGE] Local blabs ledger cleared.', 'warning');
    }
  });

  document.getElementById('btn-clear-logs').addEventListener('click', () => {
    state.logs = [];
    renderLogs();
  });

  document.getElementById('input-auto-convert').addEventListener('change', (e) => {
    state.autoConvert = e.target.checked;
    addLog(`Auto-convert setting updated: ${state.autoConvert ? 'ENABLED' : 'DISABLED'}`, 'info');
  });

  document.getElementById('input-miner-email').addEventListener('input', (e) => {
    state.miner_identity_email = e.target.value.trim();
    saveState();
  });

  document.getElementById('input-amount').addEventListener('input', (e) => {
    state.app_user_selected_amount = e.target.value;
    saveState();
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.blabs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bitminer_blabs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('[EXPORT] JSON data export generated successfully.', 'success');
  });

  updateStats();
  renderLogs();
  renderBlabList();
  setupPWA();
}

function switchTab(tab) {
  state.activeTab = tab;
  const tabMine = document.getElementById('tab-mine');
  const tabConvert = document.getElementById('tab-convert');
  const secMine = document.getElementById('section-mine');
  const secConvert = document.getElementById('section-convert');

  if (tab === 'mine') {
    tabMine.classList.add('active');
    tabConvert.classList.remove('active');
    if (window.innerWidth <= 980) {
      secMine.style.display = 'block';
      secConvert.style.display = 'none';
    }
  } else {
    tabConvert.classList.add('active');
    tabMine.classList.remove('active');
    if (window.innerWidth <= 980) {
      secMine.style.display = 'none';
      secConvert.style.display = 'block';
    }
  }
}

window.addEventListener('resize', () => {
  const secMine = document.getElementById('section-mine');
  const secConvert = document.getElementById('section-convert');
  if (secMine && secConvert) {
    if (window.innerWidth > 980) {
      secMine.style.display = 'block';
      secConvert.style.display = 'block';
    } else {
      switchTab(state.activeTab);
    }
  }
});

// Initialize
renderApp();
