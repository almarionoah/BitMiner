console.log('BitMiner application initialized');

const appEl = document.getElementById('app');

appEl.innerHTML = `
  <div class="app-container">
    <header>
      <h1>BitMiner Pro</h1>
      <div class="nav-tabs">
        <button class="nav-btn active" data-tab="mine">Mine</button>
        <button class="nav-btn" data-tab="convert">Convert</button>
      </div>
    </header>

    <div class="main-content">
      <div id="pwa-container"></div>

      <!-- MINE PANEL -->
      <div id="panel-mine" class="panel active">
        <div class="card">
          <h3>Miner Identity & Credentials</h3>
          <div class="form-group">
            <label>Auto-Generated Miner Email (Base64)</label>
            <input type="text" id="miner-email" readonly />
          </div>
          <div class="form-group">
            <label>Auto-Generated Session Key (Base64)</label>
            <input type="text" id="miner-key" readonly />
          </div>
          <button class="action-btn" id="btn-start-mining">Start Mining Blabs</button>
        </div>

        <div class="card">
          <h3>Mining Feed Terminal</h3>
          <div id="terminal-mine" class="terminal-box">
            <div>[System] Initialized BitMiner core engine. Ready to mine...</div>
          </div>
        </div>
      </div>

      <!-- CONVERT PANEL -->
      <div id="panel-convert" class="panel">
        <div class="card">
          <h3>Blab Conversion Processor</h3>
          <div class="form-group">
            <label>Miner Identity Email ([miner_identity_email])</label>
            <input type="text" id="convert-email" placeholder="Email will auto-fill from mining session" />
          </div>
          <div class="form-group">
            <label>Conversion Amount ([app_user_selected_amount])</label>
            <input type="number" id="convert-amount" value="1.0" min="0.1" step="0.1" />
          </div>
          <div class="form-group">
            <label>Current Mined Blab String ([blab])</label>
            <input type="text" id="convert-blab" placeholder="No active blab generated yet" readonly />
          </div>
          <button class="action-btn" id="btn-run-conversion">Process Conversion</button>
        </div>

        <div class="card">
          <h3>Conversion Feed Terminal</h3>
          <div id="terminal-convert" class="terminal-box">
            <div>[System] Conversion engine online. Awaiting data...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// State variables
let state = {
  email: '',
  key: '',
  blab: '',
  miningInterval: null,
  isMining: false
};

// Generate initial base64 credentials
function generateCredentials() {
  const rawEmail = `miner_${Math.random().toString(36.substring(2, 9))}@bitminer.io`;
  state.email = btoa(rawEmail);
  state.key = btoa(Math.random().toString(36) + Date.now().toString());

  document.getElementById('miner-email').value = state.email;
  document.getElementById('miner-key').value = state.key;
  document.getElementById('convert-email').value = state.email;
}

generateCredentials();

// Tab switching logic
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    document.getElementById(`panel-${tab}`).classList.add('active');
  });
});

// Mining simulation and Blab generation
const terminalMine = document.getElementById('terminal-mine');
const terminalConvert = document.getElementById('terminal-convert');
const startMiningBtn = document.getElementById('btn-start-mining');

startMiningBtn.addEventListener('click', () => {
  if (state.isMining) {
    clearInterval(state.miningInterval);
    state.isMining = false;
    startMiningBtn.textContent = 'Start Mining Blabs';
    appendTerminal(terminalMine, '[System] Mining halted.');
    return;
  }

  state.isMining = true;
  startMiningBtn.textContent = 'Stop Mining';
  appendTerminal(terminalMine, '[System] Mining started with identity: ' + state.email);

  state.miningInterval = setInterval(() => {
    const rawBlab = `blab_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    state.blab = btoa(rawBlab);
    document.getElementById('convert-blab').value = state.blab;
    appendTerminal(terminalMine, `[Mined] Generated blab: ${state.blab}`);
    
    // Auto-convert feed trigger
    processAutomaticConversion(state.blab);
  }, 4000);
});

function appendTerminal(terminal, message) {
  const div = document.createElement('div');
  div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

function processAutomaticConversion(blabValue) {
  const amountVal = document.getElementById('convert-amount').value || '1.0';
  const emailVal = document.getElementById('convert-email').value || state.email;
  
  const outputMsg = `[Conversion Success] miner_identity_email: ${emailVal} | app_user_selected_amount: ${amountVal} | blab: ${blabValue} -> Processed & Credited.`;
  appendTerminal(terminalConvert, outputMsg);
}

// Manual conversion button
document.getElementById('btn-run-conversion').addEventListener('click', () => {
  const emailVal = document.getElementById('convert-email').value;
  const amountVal = document.getElementById('convert-amount').value;
  const blabVal = document.getElementById('convert-blab').value;

  if (!blabVal) {
    appendTerminal(terminalConvert, '[Error] No blab available to convert. Start mining first.');
    return;
  }

  const outputMsg = `[Manual Conversion] miner_identity_email: ${emailVal} | app_user_selected_amount: ${amountVal} | blab: ${blabVal} -> Converted successfully.`;
  appendTerminal(terminalConvert, outputMsg);
});

// PWA functionality simulation
const pwaContainer = document.getElementById('pwa-container');
let deferredPrompt = null;

pwaContainer.innerHTML = `
  <div class="pwa-banner">
    <span>Install BitMiner App for desktop & mobile experience</span>
    <button class="pwa-btn" id="pwa-install-btn">Download PWA</button>
  </div>
`;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

document.getElementById('pwa-install-btn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      appendTerminal(terminalMine, '[PWA] App installed successfully.');
    }
    deferredPrompt = null;
  } else {
    alert('BitMiner is ready for installation or already installed as a PWA.');
    appendTerminal(terminalMine, '[PWA] Installation package ready for download.');
  }
});
