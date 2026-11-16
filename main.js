import './src/style.css';

const app = document.getElementById('app');

let currentTab = 'mine';
let isMining = false;
let mineInterval = null;
let minedBlabs = [];
let terminalLogs = [
  { time: new Date().toLocaleTimeString(), text: 'BitMiner system initialized. Ready for operation.' }
];

let minerIdentityEmail = '';
let base64Key = '';
let selectedAmount = '1.0';

function logToTerminal(text) {
  terminalLogs.push({ time: new Date().toLocaleTimeString(), text });
  if (terminalLogs.length > 100) terminalLogs.shift();
  render();
}

function generateIdentity() {
  const rawEmail = `miner_${Math.random().toString(36.substring(2, 9))}@it-skokos.com`;
  minerIdentityEmail = btoa(rawEmail);
  const rawKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  base64Key = btoa(rawKey);
  logToTerminal(`Generated Miner Identity Email [miner_identity_email]: ${minerIdentityEmail}`);
  logToTerminal(`Generated Secure Base64 Key: ${base64Key}`);
}

function startMining() {
  if (!minerIdentityEmail) {
    generateIdentity();
  }
  isMining = true;
  logToTerminal('Mining session started. Generating [blab] tokens...');
  render();

  mineInterval = setInterval(() => {
    const rawBlab = `blab_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const blab = btoa(rawBlab);
    minedBlabs.push(blab);
    logToTerminal(`Mined new [blab]: ${blab}`);
    render();
  }, 2500);
}

function stopMining() {
  isMining = false;
  clearInterval(mineInterval);
  logToTerminal('Mining session paused.');
  render();
}

function processConversion() {
  if (minedBlabs.length === 0) {
    logToTerminal('Conversion error: No [blab] tokens available to convert.');
    alert('Please mine some [blab] tokens first.');
    return;
  }

  const app_user_selected_amount = parseFloat(selectedAmount) || 1.0;
  logToTerminal(`Initiating conversion for amount [app_user_selected_amount]: ${app_user_selected_amount}`);

  minedBlabs.forEach((blab, index) => {
    const conversionResult = window.btoa(JSON.stringify({
      blab,
      miner_identity_email: minerIdentityEmail,
      app_user_selected_amount,
      timestamp: Date.now()
    }));
    logToTerminal(`[CONVERTED] [blab]: ${blab.substring(0, 10)}... | [miner_identity_email]: ${minerIdentityEmail.substring(0, 10)}... | [app_user_selected_amount]: ${app_user_selected_amount} | Output: ${conversionResult.substring(0, 24)}...`);
  });

  minedBlabs = [];
  logToTerminal('Batch conversion completed successfully. Feed terminal updated.');
  render();
}

function render() {
  app.innerHTML = `
    <header>
      <div class="logo">BitMiner Terminal</div>
      <nav>
        <button class="nav-btn ${currentTab === 'mine' ? 'active' : ''}" id="nav-mine">Mine</button>
        <button class="nav-btn ${currentTab === 'convert' ? 'active' : ''}" id="nav-convert">Convert</button>
      </nav>
    </header>

    <main>
      ${currentTab === 'mine' ? `
        <div class="card">
          <div class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Miner Dashboard
          </div>
          <div class="form-group">
            <label>Miner Identity Email (Base64)</label>
            <input type="text" readonly value="${minerIdentityEmail || 'Not generated'}" placeholder="Click start to generate identity..." />
          </div>
          <div class="form-group">
            <label>Cryptographic Key (Base64)</label>
            <input type="text" readonly value="${base64Key || 'Not generated'}" placeholder="Pending identity generation..." />
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
            ${!isMining ? `
              <button class="action-btn" id="start-mine-btn" style="flex:1;">Start Mining</button>
            ` : `
              <button class="action-btn" id="stop-mine-btn" style="flex:1; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">Stop Mining</button>
            `}
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Mining Statistics
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <label>Status</label>
              <div class="stat-value" style="color: ${isMining ? '#34d399' : '#94a3b8'}">${isMining ? 'ACTIVE' : 'IDLE'}</div>
            </div>
            <div class="stat-box">
              <label>Mined [blab]</label>
              <div class="stat-value">${minedBlabs.length}</div>
            </div>
            <div class="stat-box">
              <label>Efficiency</label>
              <div class="stat-value">99.8%</div>
            </div>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-top: 0.5rem;">
            Auto-generating valid base64 encrypted email identities and streaming mined [blab] units into secure storage buffers.
          </p>
        </div>
      ` : `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            Conversion & Payout Terminal
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
              <label>Conversion Amount ([app_user_selected_amount])</label>
              <input type="number" id="amount-input" value="${selectedAmount}" step="0.1" min="0.1" />
            </div>
            <div class="form-group">
              <label>Pending Mined [blab] Count</label>
              <input type="text" readonly value="${minedBlabs.length} units ready" />
            </div>
          </div>
          <button class="action-btn" id="convert-btn" style="margin-top: 1rem;">Process Conversion & Output to Terminal</button>
        </div>
      `}

      <div class="card terminal-card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Feed Terminal Output</span>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">LIVE STREAM</span>
        </div>
        <div class="terminal-output" id="terminal-box">
          ${terminalLogs.map(log => `
            <div class="terminal-line">
              <span class="terminal-timestamp">[${log.time}]</span>
              <span>${log.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </main>

    <footer>
      BitMiner SaaS Platform &copy; I.T. Skokos. All rights reserved. PWA Ready.
    </footer>
  `;

  attachEventListeners();
}

function attachEventListeners() {
  const navMine = document.getElementById('nav-mine');
  const navConvert = document.getElementById('nav-convert');

  if (navMine) {
    navMine.addEventListener('click', () => {
      currentTab = 'mine';
      render();
    });
  }

  if (navConvert) {
    navConvert.addEventListener('click', () => {
      currentTab = 'convert';
      render();
    });
  }

  const startBtn = document.getElementById('start-mine-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startMining);
  }

  const stopBtn = document.getElementById('stop-mine-btn');
  if (stopBtn) {
    stopBtn.addEventListener('click', stopMining);
  }

  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn) {
    convertBtn.addEventListener('click', processConversion);
  }

  const amountInput = document.getElementById('amount-input');
  if (amountInput) {
    amountInput.addEventListener('input', (e) => {
      selectedAmount = e.target.value;
    });
  }

  const terminalBox = document.getElementById('terminal-box');
  if (terminalBox) {
    terminalBox.scrollTop = terminalBox.scrollHeight;
  }
}

render();
