import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <h1>BitMiner</h1>
      <nav class="app-nav">
        <button id="nav-mine" class="nav-btn active">Mine</button>
        <button id="nav-convert" class="nav-btn">Convert</button>
      </nav>
    </header>
    
    <main class="app-main">
      <section id="view-mine" class="view-section active">
        <div class="card">
          <h2>Cryptocurrency Mining Terminal</h2>
          <p class="subtitle">Auto-generating secure credentials and mined blocks.</p>
          <div class="form-group">
            <label>Miner Identity Email (Base64):</label>
            <input type="text" id="miner-identity-email" readonly class="input-readonly" />
          </div>
          <div class="form-group">
            <label>Generated Key / Blab:</label>
            <input type="text" id="blab-key" readonly class="input-readonly" />
          </div>
          <button id="btn-toggle-mine" class="btn btn-primary">Start Mining</button>
        </div>
      </section>

      <section id="view-convert" class="view-section">
        <div class="card">
          <h2>Data Conversion Processor</h2>
          <p class="subtitle">Convert mined blabs with designated amounts.</p>
          <div class="form-group">
            <label for="convert-amount">App User Selected Amount ([app_user_selected_amount]):</label>
            <input type="number" id="convert-amount" value="100" min="1" class="input-field" />
          </div>
          <div class="form-group">
            <label for="convert-blab">Current Mined Blab ([blab]):</label>
            <input type="text" id="convert-blab" placeholder="Generate or paste blab..." class="input-field" />
          </div>
          <div class="form-group">
            <label for="convert-email">Miner Identity Email ([miner_identity_email]):</label>
            <input type="text" id="convert-email" placeholder="Auto-filled from miner..." class="input-field" />
          </div>
          <button id="btn-process-convert" class="btn btn-secondary">Process Conversion</button>
        </div>
      </section>

      <section class="terminal-section">
        <h3>Feed Terminal</h3>
        <div id="terminal-output" class="terminal-output">System initialized. Ready for mining and conversion tasks...</div>
      </section>
    </main>
  </div>
`;

let miningInterval = null;
let isMining = false;
let currentBlab = '';
let currentEmail = '';

function logTerminal(message) {
  const term = document.getElementById('terminal-output');
  const timestamp = new Date().toLocaleTimeString();
  term.innerHTML += `<div>[${timestamp}] ${message}</div>`;
  term.scrollTop = term.scrollHeight;
}

function generateCredentials() {
  const randomUser = 'miner_' + Math.random().toString(36.substring(2, 9)) + '@bitminer.io';
  currentEmail = btoa(randomUser);
  const rawKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
  currentBlab = btoa(rawKey);

  document.getElementById('miner-identity-email').value = currentEmail;
  document.getElementById('blab-key').value = currentBlab;
  document.getElementById('convert-blab').value = currentBlab;
  document.getElementById('convert-email').value = currentEmail;

  logTerminal(`Generated miner_identity_email: ${currentEmail}`);
  logTerminal(`Generated blab: ${currentBlab}`);
}

// Navigation handling
const navMine = document.getElementById('nav-mine');
const navConvert = document.getElementById('nav-convert');
const viewMine = document.getElementById('view-mine');
const viewConvert = document.getElementById('view-convert');

navMine.addEventListener('click', () => {
  navMine.classList.add('active');
  navConvert.classList.remove('active');
  viewMine.classList.add('active');
  viewConvert.classList.remove('active');
});

navConvert.addEventListener('click', () => {
  navConvert.classList.add('active');
  navMine.classList.remove('active');
  viewConvert.classList.add('active');
  viewMine.classList.remove('active');
});

// Mining toggle
const btnToggleMine = document.getElementById('btn-toggle-mine');
btnToggleMine.addEventListener('click', () => {
  if (!isMining) {
    isMining = true;
    btnToggleMine.textContent = 'Stop Mining';
    btnToggleMine.classList.add('btn-danger');
    logTerminal('Mining started...');
    generateCredentials();
    miningInterval = setInterval(() => {
      generateCredentials();
    }, 5000);
  } else {
    isMining = false;
    btnToggleMine.textContent = 'Start Mining';
    btnToggleMine.classList.remove('btn-danger');
    clearInterval(miningInterval);
    logTerminal('Mining stopped.');
  }
});

// Conversion processing
const btnProcessConvert = document.getElementById('btn-process-convert');
btnProcessConvert.addEventListener('click', () => {
  const blab = document.getElementById('convert-blab').value;
  const miner_identity_email = document.getElementById('convert-email').value;
  const app_user_selected_amount = document.getElementById('convert-amount').value;

  if (!blab || !miner_identity_email || !app_user_selected_amount) {
    logTerminal('Error: Missing required parameters for conversion.');
    return;
  }

  logTerminal(`Processing conversion for email: ${miner_identity_email}`);
  logTerminal(`Using blab: ${blab}`);
  logTerminal(`App user selected amount: ${app_user_selected_amount}`);

  // Simulated conversion algorithm execution
  setTimeout(() => {
    const conversionResult = btoa(`${miner_identity_email}:${blab}:${app_user_selected_amount}`);
    logTerminal(`SUCCESS: Converted output hash -> ${conversionResult}`);
  }, 600);
});

// Initial generation on load
generateCredentials();
