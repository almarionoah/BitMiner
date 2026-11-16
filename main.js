import './style.css';

const app = document.querySelector('#app');

// Application State
let currentTab = 'mine';
let isMining = false;
let mineInterval = null;
let minedItems = [];
let conversionLogs = [];
let appUserSelectedAmount = 1;

// Render shell structure
function renderApp() {
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <h1>BitMiner</h1>
        </div>
        <nav class="app-nav">
          <button id="nav-mine" class="nav-btn ${currentTab === 'mine' ? 'active' : ''}">Mine</button>
          <button id="nav-convert" class="nav-btn ${currentTab === 'convert' ? 'active' : ''}">Convert</button>
        </nav>
      </header>

      <main class="app-main">
        <div id="tab-content" class="tab-content">
          <!-- Content injected dynamically -->
        </div>
      </main>

      <footer class="app-footer">
        <p>&copy; I.T. Skokos — BitMiner SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  `;

  document.getElementById('nav-mine').addEventListener('click', () => {
    currentTab = 'mine';
    renderTab();
  });

  document.getElementById('nav-convert').addEventListener('click', () => {
    currentTab = 'convert';
    renderTab();
  });

  renderTab();
}

function renderTab() {
  // Update nav active states
  const mineBtn = document.getElementById('nav-mine');
  const convertBtn = document.getElementById('nav-convert');
  if (mineBtn && convertBtn) {
    mineBtn.className = `nav-btn ${currentTab === 'mine' ? 'active' : ''}`;
    convertBtn.className = `nav-btn ${currentTab === 'convert' ? 'active' : ''}`;
  }

  const container = document.getElementById('tab-content');
  if (!container) return;

  if (currentTab === 'mine') {
    container.innerHTML = `
      <div class="card mine-card">
        <h2>Cryptocurrency Mining Terminal</h2>
        <p class="subtitle">Auto-generates secure base64 identities and mined data blocks ([blab]).</p>
        
        <div class="mining-controls">
          <button id="toggle-mine-btn" class="btn ${isMining ? 'btn-danger' : 'btn-primary'}">
            ${isMining ? 'Stop Mining' : 'Start Mining'}
          </button>
          <div class="status-indicator">
            <span class="dot ${isMining ? 'pulsing' : ''}"></span>
            <span>${isMining ? 'Mining Active...' : 'Idle'}</span>
          </div>
        </div>

        <div class="terminal-section">
          <h3>Feed Terminal</h3>
          <div id="feed-terminal" class="terminal">
            ${minedItems.length === 0 ? '<div class="terminal-placeholder">No data mined yet. Click Start Mining to begin.</div>' : minedItems.map(item => `
              <div class="terminal-log">
                <span class="log-time">[${item.timestamp}]</span>
                <span class="log-email">Email: ${item.miner_identity_email}</span>
                <span class="log-blab">Blab: ${item.blab}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('toggle-mine-btn').addEventListener('click', () => {
      isMining = !isMining;
      if (isMining) {
        startMiningProcess();
      } else {
        stopMiningProcess();
      }
      renderTab();
    });
  } else {
    container.innerHTML = `
      <div class="card convert-card">
        <h2>Data Conversion & Processing</h2>
        <p class="subtitle">Process mined base64 blabs using your selected amount.</p>

        <div class="form-group">
          <label for="amount-input">App User Selected Amount ([app_user_selected_amount]):</label>
          <input type="number" id="amount-input" value="${appUserSelectedAmount}" min="1" max="1000" class="input-field" />
        </div>

        <div class="form-group">
          <label for="convert-email-input">Miner Identity Email ([miner_identity_email]):</label>
          <input type="text" id="convert-email-input" value="${minedItems.length > 0 ? minedItems[minedItems.length - 1].miner_identity_email : btoa('miner@itskokos.com')}" readonly class="input-field readonly" />
        </div>

        <button id="run-conversion-btn" class="btn btn-primary">
          Process Conversion
        </button>

        <div class="terminal-section">
          <h3>Conversion Output Feed</h3>
          <div id="conversion-terminal" class="terminal">
            ${conversionLogs.length === 0 ? '<div class="terminal-placeholder">No conversion outputs yet. Run conversion to process mined blabs.</div>' : conversionLogs.map(log => `
              <div class="terminal-log success">
                <span class="log-time">[${log.timestamp}]</span>
                <span>Amount: <strong>${log.app_user_selected_amount}</strong></span>
                <span>Email: ${log.miner_identity_email}</span>
                <span>Result Blab: ${log.blab}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('amount-input').addEventListener('input', (e) => {
      appUserSelectedAmount = parseInt(e.target.value) || 1;
    });

    document.getElementById('run-conversion-btn').addEventListener('click', () => {
      runConversionProcessing();
    });
  }
}

function startMiningProcess() {
  if (mineInterval) clearInterval(mineInterval);
  mineInterval = setInterval(() => {
    const rawEmail = `miner_${Math.floor(Math.random() * 100000)}@itskokos.com`;
    const miner_identity_email = btoa(rawEmail);
    const randomKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const blab = btoa(randomKey);
    const timestamp = new Date().toLocaleTimeString();

    minedItems.unshift({ timestamp, miner_identity_email, blab });
    if (minedItems.length > 50) minedItems.pop();

    if (currentTab === 'mine') {
      renderTab();
    }
  }, 3000);
}

function stopMiningProcess() {
  if (mineInterval) {
    clearInterval(mineInterval);
    mineInterval = null;
  }
}

function runConversionProcessing() {
  if (minedItems.length === 0) {
    alert('Please mine some data blocks first before converting.');
    return;
  }

  conversionLogs = [];
  minedItems.forEach(item => {
    const miner_identity_email = item.miner_identity_email;
    const blab = btoa(item.blab + '_converted_' + appUserSelectedAmount);
    const timestamp = new Date().toLocaleTimeString();

    conversionLogs.push({
      timestamp,
      app_user_selected_amount,
      miner_identity_email,
      blab
    });
  });

  renderTab();
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  // Seed initial mined item so convert works out of the box
  minedItems.unshift({
    timestamp: new Date().toLocaleTimeString(),
    miner_identity_email: btoa('default_miner@itskokos.com'),
    blab: btoa('initial_seed_key')
  });
});
