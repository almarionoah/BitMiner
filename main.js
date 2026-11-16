import './style.css';

console.log('BitMiner application initialized');

const App = () => {
  return `
    <div class="app-container">
      <header class="app-header">
        <div class="logo-area">
          <h1>⚡ BitMiner</h1>
          <span class="badge">v1.0.0 Secure</span>
        </div>
        <nav class="nav-tabs">
          <button class="nav-btn active" data-tab="mine">Mine</button>
          <button class="nav-btn" data-tab="convert">Convert</button>
          <button class="nav-btn" data-tab="pwa">Download PWA</button>
        </nav>
      </header>

      <main class="app-main">
        <!-- MINE TAB -->
        <section id="tab-mine" class="tab-content active">
          <div class="card">
            <h2>Cryptocurrency Mining Terminal</h2>
            <p class="desc">Auto-generate secure miner identity and mine encrypted data blocks ([blab]).</p>
            
            <div class="mining-controls">
              <div class="input-group">
                <label>Miner Identity Email (Base64):</label>
                <input type="text" id="miner-email" readonly placeholder="Auto-generating identity..." />
              </div>
              <div class="input-group">
                <label>Generated Base64 Key / Blab Hash:</label>
                <input type="text" id="miner-key" readonly placeholder="Start mining to generate blab..." />
              </div>
              <div class="btn-row">
                <button id="start-mining-btn" class="btn primary">Start Mining</button>
                <button id="stop-mining-btn" class="btn danger" disabled>Stop Mining</button>
              </div>
            </div>

            <div class="terminal-container">
              <div class="terminal-header">
                <span>Live Feed Terminal</span>
                <span class="status-dot" id="terminal-status"></span>
              </div>
              <div id="terminal-output" class="terminal-body">
                [System] Ready to start mining process...
              </div>
            </div>
          </div>
        </section>

        <!-- CONVERT TAB -->
        <section id="tab-convert" class="tab-content">
          <div class="card">
            <h2>Data Conversion & Processing</h2>
            <p class="desc">Process mined data blocks using [blab], [miner_identity_email], and [app_user_selected_amount].</p>
            
            <div class="conversion-form">
              <div class="input-group">
                <label for="convert-email">Miner Identity Email:</label>
                <input type="text" id="convert-email" placeholder="Enter or auto-fill miner email..." />
              </div>
              <div class="input-group">
                <label for="convert-blab">Blab Data String (Base64):</label>
                <input type="text" id="convert-blab" placeholder="Enter mined base64 blab..." />
              </div>
              <div class="input-group">
                <label for="convert-amount">Selected Conversion Amount ([app_user_selected_amount]):</label>
                <input type="number" id="convert-amount" value="100" min="1" max="100000" />
              </div>
              <button id="process-conversion-btn" class="btn primary">Process Conversion</button>
            </div>

            <div class="conversion-results">
              <h3>Conversion Output Feed</h3>
              <div id="conversion-output" class="terminal-body">
                [Conversion] Awaiting input parameters...
              </div>
            </div>
          </div>
        </section>

        <!-- PWA TAB -->
        <section id="tab-pwa" class="tab-content">
          <div class="card center-card">
            <h2>Install BitMiner PWA</h2>
            <p class="desc">Download and install BitMiner as a desktop or mobile Progressive Web App.</p>
            <div class="pwa-actions">
              <button id="install-pwa-btn" class="btn primary lg">Install App Now</button>
              <p id="pwa-status-msg" class="muted">App is ready for offline caching and installation.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
};

document.getElementById('app').innerHTML = App();

// State Management
let miningInterval = null;
let minedBlabsCount = 0;
let lastGeneratedBlab = '';
let lastGeneratedEmail = '';

// Helper to log to terminal
const logTerminal = (msg, isError = false) => {
  const term = document.getElementById('terminal-output');
  if (!term) return;
  const timestamp = new Date().toLocaleTimeString();
  const colorClass = isError ? 'text-red' : 'text-green';
  term.innerHTML += `\n<span class="${colorClass}">[${timestamp}] ${msg}</span>`;
  term.scrollTop = term.scrollHeight;
};

const logConversionTerminal = (msg) => {
  const term = document.getElementById('conversion-output');
  if (!term) return;
  const timestamp = new Date().toLocaleTimeString();
  term.innerHTML += `\n<span class="text-cyan">[${timestamp}] ${msg}</span>`;
  term.scrollTop = term.scrollHeight;
};

// Tab Switching Logic
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    e.target.classList.add('active');
    const tabId = 'tab-' + e.target.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Mining Logic
const startMiningBtn = document.getElementById('start-mining-btn');
const stopMiningBtn = document.getElementById('stop-mining-btn');
const minerEmailInput = document.getElementById('miner-email');
const minerKeyInput = document.getElementById('miner-key');
const terminalStatus = document.getElementById('terminal-status');

startMiningBtn.addEventListener('click', () => {
  const rawEmail = `miner_${Math.random().toString(36).substring(2, 9)}@bitminer.io`;
  lastGeneratedEmail = btoa(rawEmail);
  minerEmailInput.value = lastGeneratedEmail;
  document.getElementById('convert-email').value = lastGeneratedEmail;

  startMiningBtn.disabled = true;
  stopMiningBtn.disabled = false;
  terminalStatus.classList.add('active');
  logTerminal(`Initialized miner identity: ${lastGeneratedEmail}`);

  miningInterval = setInterval(() => {
    minedBlabsCount++;
    const rawBlabData = `blab_block_${minedBlabsCount}_${Date.now()}`;
    lastGeneratedBlab = btoa(rawBlabData);
    minerKeyInput.value = lastGeneratedBlab;
    document.getElementById('convert-blab').value = lastGeneratedBlab;

    logTerminal(`Mined block #${minedBlabsCount} -> [blab]: ${lastGeneratedBlab}`);
    
    // Auto-convert feed preview as stipulated
    const autoAmount = 50;
    logConversionTerminal(`Auto-processed [blab]: ${lastGeneratedBlab.substring(0, 12)}... | [miner_identity_email]: ${lastGeneratedEmail.substring(0, 10)}... | [app_user_selected_amount]: ${autoAmount}`);
  }, 3000);
});

stopMiningBtn.addEventListener('click', () => {
  clearInterval(miningInterval);
  startMiningBtn.disabled = false;
  stopMiningBtn.disabled = true;
  terminalStatus.classList.remove('active');
  logTerminal(`Mining halted by user. Total blocks mined: ${minedBlabsCount}`, true);
});

// Conversion Processing Logic
const processConversionBtn = document.getElementById('process-conversion-btn');
processConversionBtn.addEventListener('click', () => {
  const emailVal = document.getElementById('convert-email').value.trim();
  const blabVal = document.getElementById('convert-blab').value.trim();
  const amountVal = parseFloat(document.getElementById('convert-amount').value) || 0;

  if (!emailVal || !blabVal) {
    logConversionTerminal(`[Error] Missing required [miner_identity_email] or [blab] data.`);
    alert('Please provide both Miner Identity Email and Blab Data string.');
    return;
  }

  logConversionTerminal(`Processing conversion...`);
  setTimeout(() => {
    const conversionResult = (amountVal * 1.042).toFixed(4);
    logConversionTerminal(`SUCCESS: Converted [blab]=${blabVal.substring(0, 10)}... for [miner_identity_email]=${emailVal.substring(0, 10)}... with [app_user_selected_amount]=${amountVal} -> Output: ${conversionResult} XBT`);
  }, 500);
});

// PWA Install Mock
const installPwaBtn = document.getElementById('install-pwa-btn');
const pwaStatusMsg = document.getElementById('pwa-status-msg');
installPwaBtn.addEventListener('click', () => {
  installPwaBtn.textContent = 'Installing...';
  setTimeout(() => {
    installPwaBtn.textContent = 'Installed Successfully';
    installPwaBtn.disabled = true;
    pwaStatusMsg.textContent = 'BitMiner is now installed as a Progressive Web App.';
  }, 1000);
});
