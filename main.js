import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <div class="brand">
        <span class="logo-icon">⚡</span>
        <h1>BitMiner</h1>
      </div>
      <nav class="app-nav">
        <button class="nav-btn active" data-tab="mine">Mine</button>
        <button class="nav-btn" data-tab="convert">Convert</button>
      </nav>
    </header>

    <main class="app-main">
      <!-- Mine Tab -->
      <section id="tab-mine" class="tab-content active">
        <div class="card-grid">
          <div class="card control-card">
            <h2>Mining Control Center</h2>
            <p class="subtitle">Auto-generating secure base64 credentials and mining blocks.</p>
            <div class="metric-box">
              <span class="label">Hashrate</span>
              <span class="value" id="hashrate">0.00 H/s</span>
            </div>
            <div class="metric-box">
              <span class="label">Mined Balance</span>
              <span class="value highlight" id="balance">0.00000000 BTC</span>
            </div>
            <div class="action-row">
              <button id="toggle-mining-btn" class="btn primary-gradient">Start Mining</button>
              <button id="reset-btn" class="btn secondary-ghost">Reset</button>
            </div>
          </div>

          <div class="card credentials-card">
            <h2>Encrypted Credentials</h2>
            <p class="subtitle">Active miner identity tokens generated on session start.</p>
            <div class="credential-group">
              <label>Base64 Encrypted Email</label>
              <div class="code-box" id="b64-email">Waiting for miner start...</div>
            </div>
            <div class="credential-group">
              <label>Base64 API / Session Key</label>
              <div class="code-box" id="b64-key">Waiting for miner start...</div>
            </div>
          </div>
        </div>

        <div class="card log-card">
          <h3>Live Mining Stream</h3>
          <div class="terminal" id="terminal-log">
            <div class="log-entry">[System] BitMiner client initialized. Ready to start mining.</div>
          </div>
        </div>
      </section>

      <!-- Convert Tab -->
      <section id="tab-convert" class="tab-content">
        <div class="card convert-card">
          <h2>Asset Conversion</h2>
          <p class="subtitle">Convert your mined crypto instantly to fiat or other assets.</p>
          <div class="form-group">
            <label>Amount to Convert (BTC)</label>
            <input type="number" id="convert-amount" value="0.001" step="0.0001" min="0" />
          </div>
          <div class="form-group">
            <label>Target Currency</label>
            <select id="target-currency">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="ETH">ETH (Ξ)</option>
            </select>
          </div>
          <div class="conversion-result">
            <span>Estimated Payout:</span>
            <strong id="conversion-output">$94.50 USD</strong>
          </div>
          <button id="convert-action-btn" class="btn primary-gradient">Execute Conversion</button>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; BitMiner Platform. Secure Distributed Mining.</p>
    </footer>
  </div>
`;

// Application Logic
let isMining = false;
let balance = 0.00000000;
let hashrate = 0;
let miningInterval = null;

function generateBase64Credentials() {
  const domains = ['bitminer.io', 'crypto-node.net', 'hash-vault.org', 'secure-mine.com'];
  const randomUser = 'miner_' + Math.random().toString(36).substring(2, 9);
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const rawEmail = `${randomUser}@${randomDomain}`;
  const b64Email = btoa(rawEmail);

  const rawKeyBytes = new Uint8Array(24);
  window.crypto.getRandomValues(rawKeyBytes);
  const b64Key = btoa(String.fromCharCode.apply(null, rawKeyBytes));

  document.getElementById('b64-email').innerText = b64Email;
  document.getElementById('b64-key').innerText = b64Key;
  addLog(`Generated encrypted identity: ${b64Email.substring(0, 12)}...`);
}

function addLog(message) {
  const term = document.getElementById('terminal-log');
  if (!term) return;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = new Date().toLocaleTimeString();
  entry.innerText = `[${time}] ${message}`;
  term.appendChild(entry);
  term.scrollTop = term.scrollHeight;
}

// Tab switching
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    e.target.classList.add('active');
    const tabId = 'tab-' + e.target.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Mining Toggle
const toggleBtn = document.getElementById('toggle-mining-btn');
const hashrateEl = document.getElementById('hashrate');
const balanceEl = document.getElementById('balance');

toggleBtn.addEventListener('click', () => {
  isMining = !isMining;
  if (isMining) {
    toggleBtn.innerText = 'Stop Mining';
    toggleBtn.classList.add('active-mining');
    generateBase64Credentials();
    addLog('Mining sequence started. Connecting to pool...');
    
    hashrate = (145.2 + Math.random() * 25.0);
    hashrateEl.innerText = hashrate.toFixed(2) + ' H/s';

    miningInterval = setInterval(() => {
      balance += 0.00000125;
      balanceEl.innerText = balance.toFixed(8) + ' BTC';
      hashrate = 140 + Math.random() * 35;
      hashrateEl.innerText = hashrate.toFixed(2) + ' H/s';
      if (Math.random() < 0.25) {
        addLog(`Found valid block share! Hash: 00000000${Math.random().toString(16).substring(2, 10)}`);
      }
    }, 1500);
  } else {
    toggleBtn.innerText = 'Start Mining';
    toggleBtn.classList.remove('active-mining');
    clearInterval(miningInterval);
    hashrateEl.innerText = '0.00 H/s';
    addLog('Mining paused by user.');
  }
});

// Reset
document.getElementById('reset-btn').addEventListener('click', () => {
  isMining = false;
  clearInterval(miningInterval);
  toggleBtn.innerText = 'Start Mining';
  toggleBtn.classList.remove('active-mining');
  balance = 0.0;
  hashrate = 0;
  hashrateEl.innerText = '0.00 H/s';
  balanceEl.innerText = '0.00000000 BTC';
  document.getElementById('b64-email').innerText = 'Waiting for miner start...';
  document.getElementById('b64-key').innerText = 'Waiting for miner start...';
  addLog('Session reset.');
});

// Conversion logic
const convertAmountInput = document.getElementById('convert-amount');
const targetCurrencySelect = document.getElementById('target-currency');
const conversionOutput = document.getElementById('conversion-output');

function updateConversion() {
  const amt = parseFloat(convertAmountInput.value) || 0;
  const curr = targetCurrencySelect.value;
  let rate = 94500;
  if (curr === 'EUR') rate = 88000;
  if (curr === 'GBP') rate = 75000;
  if (curr === 'ETH') rate = 28.5;
  
  const total = amt * rate;
  conversionOutput.innerText = `${total.toFixed(curr === 'ETH' ? 4 : 2)} ${curr}`;
}

convertAmountInput.addEventListener('input', updateConversion);
targetCurrencySelect.addEventListener('change', updateConversion);
updateConversion();

document.getElementById('convert-action-btn').addEventListener('click', () => {
  const amt = convertAmountInput.value;
  const curr = targetCurrencySelect.value;
  alert(`Successfully converted ${amt} BTC to ${conversionOutput.innerText}!`);
});
