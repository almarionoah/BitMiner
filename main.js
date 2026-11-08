import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <div class="logo">
        <h1>⚡ BitMiner</h1>
        <span class="badge">v1.0.0</span>
      </div>
      <nav class="nav-tabs">
        <button class="nav-btn active" data-tab="mine">Mine</button>
        <button class="nav-btn" data-tab="convert">Convert</button>
      </nav>
    </header>

    <main class="app-main">
      <section id="mine-tab" class="tab-content active">
        <div class="card">
          <h2>Cryptocurrency Miner</h2>
          <p>Auto-generating encrypted base64 email addresses and cryptographic key values.</p>
          <div class="mining-stats">
            <div class="stat-box">
              <label>Status</label>
              <span id="mining-status" class="status-idle">Idle</span>
            </div>
            <div class="stat-box">
              <label>Hash Rate</label>
              <span id="hash-rate">0 H/s</span>
            </div>
            <div class="stat-box">
              <label>Mined Blocks</label>
              <span id="mined-count">0</span>
            </div>
          </div>
          <div class="action-group">
            <button id="toggle-mine-btn" class="btn primary-btn">Start Mining</button>
          </div>
        </div>

        <div class="card">
          <h3>Generated Blabs</h3>
          <div id="blabs-list" class="data-list">
            <p class="empty-state">No base64 blabs generated yet. Start mining to begin.</p>
          </div>
        </div>
      </section>

      <section id="convert-tab" class="tab-content">
        <div class="card">
          <h2>Base64 Blab Converter & Feed Terminal</h2>
          <p>Processes each generated base64 blab automatically and displays conversion outputs.</p>
          <div class="form-group">
            <label for="convert-email">Target Email / Identifier</label>
            <input type="email" id="convert-email" placeholder="miner@it-skokos.com" value="miner@it-skokos.com" />
          </div>
          <div class="action-group">
            <button id="run-convert-btn" class="btn primary-btn">Process Pending Blabs</button>
          </div>
        </div>

        <div class="card terminal-card">
          <h3>Feed Terminal</h3>
          <div id="feed-terminal" class="terminal">
            <div class="terminal-line system">[System] BitMiner terminal initialized. Ready for conversion processing.</div>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; I.T. Skokos &mdash; SaaS Platform and Face to Face Services.</p>
    </footer>
  </div>
`;

let isMining = false;
let miningInterval = null;
let hashRate = 0;
let minedCount = 0;
const generatedBlabs = [];

const statusEl = document.getElementById('mining-status');
const hashRateEl = document.getElementById('hash-rate');
const minedCountEl = document.getElementById('mined-count');
const toggleMineBtn = document.getElementById('toggle-mine-btn');
const blabsListEl = document.getElementById('blabs-list');
const feedTerminalEl = document.getElementById('feed-terminal');
const runConvertBtn = document.getElementById('run-convert-btn');
const convertEmailInput = document.getElementById('convert-email');

// Tab switching
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    e.target.classList.add('active');
    const tabId = e.target.getAttribute('data-tab');
    document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

toggleMineBtn.addEventListener('click', () => {
  isMining = !isMining;
  if (isMining) {
    toggleMineBtn.textContent = 'Stop Mining';
    toggleMineBtn.classList.add('danger');
    statusEl.textContent = 'Mining...';
    statusEl.className = 'status-active';
    
    miningInterval = setInterval(() => {
      hashRate = Math.floor(Math.random() * 500) + 1200;
      hashRateEl.textContent = `${hashRate} H/s`;
      
      // Generate email base64 & key base64
      const email = convertEmailInput.value || 'miner@it-skokos.com';
      const base64Email = btoa(email + '_' + Date.now());
      const randomKeyBytes = window.crypto.getRandomValues(new Uint8Array(16));
      const base64Key = btoa(String.fromCharCode(...randomKeyBytes));
      
      const blabObj = {
        id: ++minedCount,
        email: base64Email,
        key: base64Key,
        timestamp: new Date().toLocaleTimeString(),
        processed: false
      };
      
      generatedBlabs.push(blabObj);
      minedCountEl.textContent = minedCount;
      updateBlabsList();
      
      // Auto-process conversion on generation as requested
      processBlab(blabObj);
    }, 3000);
  } else {
    stopMining();
  }
});

function stopMining() {
  isMining = false;
  clearInterval(miningInterval);
  toggleMineBtn.textContent = 'Start Mining';
  toggleMineBtn.classList.remove('danger');
  statusEl.textContent = 'Idle';
  statusEl.className = 'status-idle';
  hashRateEl.textContent = '0 H/s';
}

function updateBlabsList() {
  if (generatedBlabs.length === 0) {
    blabsListEl.innerHTML = '<p class="empty-state">No base64 blabs generated yet. Start mining to begin.</p>';
    return;
  }
  
  blabsListEl.innerHTML = generatedBlabs.slice(-5).reverse().map(b => `
    <div class="blab-item">
      <div class="blab-header">
        <span class="blab-id">#${b.id}</span>
        <span class="blab-time">${b.timestamp}</span>
      </div>
      <div class="blab-field">
        <label>Email (b64):</label> <code>${b.email}</code>
      </div>
      <div class="blab-field">
        <label>Key (b64):</label> <code>${b.key}</code>
      </div>
    </div>
  `).join('');
}

function processBlab(blab) {
  if (blab.processed) return;
  blab.processed = true;
  
  // Decode email base64 to show verification
  let decodedEmail = '';
  try {
    decodedEmail = atob(blab.email);
  } catch(e) {
    decodedEmail = 'invalid-decoding';
  }
  
  const terminalLine = document.createElement('div');
  terminalLine.className = 'terminal-line success';
  terminalLine.innerHTML = `[Convert] Processed Blab #${blab.id} | Email B64: ${blab.email.substring(0, 16)}... | Key B64: ${blab.key.substring(0, 16)}... | Decoded: ${decodedEmail} | Status: VERIFIED & CONVERTED`;
  feedTerminalEl.appendChild(terminalLine);
  feedTerminalEl.scrollTop = feedTerminalEl.scrollHeight;
}

runConvertBtn.addEventListener('click', () => {
  const unprocessed = generatedBlabs.filter(b => !b.processed);
  if (unprocessed.length === 0) {
    const line = document.createElement('div');
    line.className = 'terminal-line warning';
    line.textContent = `[System] No pending blabs to process. Start mining to generate base64 blabs.`;
    feedTerminalEl.appendChild(line);
    feedTerminalEl.scrollTop = feedTerminalEl.scrollHeight;
    return;
  }
  unprocessed.forEach(b => processBlab(b));
});
