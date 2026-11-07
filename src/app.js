export function renderApp(container) {
  container.innerHTML = `
    <header class="app-header">
      <div class="logo-area">
        <div class="logo-icon">₿</div>
        <h1 class="logo-title">BitMiner Pro</h1>
      </div>
      <nav class="nav-tabs">
        <button class="nav-tab active" data-target="mine-view">Mine</button>
        <button class="nav-tab" data-target="convert-view">Convert</button>
      </nav>
    </header>

    <main class="main-content">
      <!-- MINE VIEW -->
      <div id="mine-view" class="view-container active">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Mining Hashrate</div>
            <div id="stat-hashrate" class="stat-value">0.00 H/s</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Mined BitCoins</div>
            <div id="stat-mined" class="stat-value">0.00000000 BTC</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Active Workers</div>
            <div id="stat-workers" class="stat-value">0</div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">⛏️ Miner Control & Credential Generator</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
            Start mining sessions to automatically generate valid base64 encrypted email addresses and cryptographic key pairs.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button id="btn-start-mining" class="btn">Start Mining</button>
            <button id="btn-stop-mining" class="btn btn-secondary" disabled>Stop Mining</button>
          </div>

          <div style="margin-top: 2rem;">
            <h3 class="form-label">Live Mining & Encryption Terminal</h3>
            <div id="mining-console" class="console-box">
              <div class="console-line">[System] BitMiner daemon ready. Click 'Start Mining' to begin.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONVERT VIEW -->
      <div id="convert-view" class="view-container">
        <div class="card">
          <h2 class="card-title">🔄 Base64 & Asset Converter</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
            Encode credentials, email identifiers, or custom strings into secure Base64 hashes instantly.
          </p>
          
          <div class="form-group">
            <label class="form-label" for="convert-input">Input Data / Email / Key</label>
            <input type="text" id="convert-input" class="form-input" placeholder="Enter text, wallet address, or email to encode..." value="miner@bitminer.io" />
          </div>

          <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
            <button id="btn-encode" class="btn">Encode to Base64</button>
            <button id="btn-decode" class="btn btn-secondary">Decode from Base64</button>
          </div>

          <div class="form-group">
            <label class="form-label">Conversion Result</label>
            <div id="convert-output" class="output-box">bWluZXJAYml0bWluZXIuaW8=</div>
          </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      &copy; ${new Date().getFullYear()} BitMiner Platform. All rights reserved.
    <div>
  `;

  setupNavigation();
  setupMiningLogic();
  setupConvertLogic();
}

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.view-container');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

function setupMiningLogic() {
  const startBtn = document.getElementById('btn-start-mining');
  const stopBtn = document.getElementById('btn-stop-mining');
  const consoleBox = document.getElementById('mining-console');
  const hashrateEl = document.getElementById('stat-hashrate');
  const minedEl = document.getElementById('stat-mined');
  const workersEl = document.getElementById('stat-workers');

  let isMining = false;
  let miningInterval = null;
  let hashrate = 0;
  let minedBtc = 0;
  let totalShares = 0;

  function logToConsole(msg) {
    const line = document.createElement('div');
    line.className = 'console-line';
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  }

  startBtn.addEventListener('click', () => {
    if (isMining) return;
    isMining = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    workersEl.textContent = '4';
    hashrate = 1420.50;
    hashrateEl.textContent = `${hashrate.toFixed(2)} H/s`;
    
    logToConsole('Initiating mining rig handshake...');
    logToConsole('Allocating cryptographic worker threads...');

    miningInterval = setInterval(() => {
      totalShares++;
      minedBtc += 0.00000125;
      minedEl.textContent = `${minedBtc.toFixed(8)} BTC`;

      if (totalShares % 3 === 0) {
        // Auto generate valid email address in base64 & key value
        const randomUser = `miner_${Math.floor(Math.random() * 90000 + 10000)}@bitminer.io`;
        const encodedEmail = btoa(randomUser);
        const rawKey = `BTC-KEY-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
        const encodedKey = btoa(rawKey);

        logToConsole(`Generated Encrypted Email: ${encodedEmail} (${randomUser})`);
        logToConsole(`Generated Base64 Key Value: ${encodedKey}`);
      } else {
        logToConsole(`Share accepted! Difficulty target met. Nonce: #${Math.floor(Math.random() * 1000000)}`);
      }
    }, 2000);
  });

  stopBtn.addEventListener('click', () => {
    if (!isMining) return;
    isMining = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    workersEl.textContent = '0';
    hashrate = 0;
    hashrateEl.textContent = '0.00 H/s';
    clearInterval(miningInterval);
    logToConsole('Mining stopped by user.');
  });
}

function setupConvertLogic() {
  const inputEl = document.getElementById('convert-input');
  const outputEl = document.getElementById('convert-output');
  const encodeBtn = document.getElementById('btn-encode');
  const decodeBtn = document.getElementById('btn-decode');

  encodeBtn.addEventListener('click', () => {
    try {
      const val = inputEl.value;
      outputEl.textContent = btoa(val);
      outputEl.style.color = 'var(--accent-cyan)';
    } catch (e) {
      outputEl.textContent = 'Error: Invalid string for Base64 encoding';
      outputEl.style.color = '#ef4444';
    }
  });

  decodeBtn.addEventListener('click', () => {
    try {
      const val = inputEl.value;
      outputEl.textContent = atob(val);
      outputEl.style.color = 'var(--accent-green)';
    } catch (e) {
      outputEl.textContent = 'Error: Invalid Base64 string';
      outputEl.style.color = '#ef4444';
    }
  });
}
