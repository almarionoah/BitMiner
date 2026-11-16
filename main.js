import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <h1>BitMiner</h1>
      <p class="subtitle">Advanced Cryptocurrency Mining & Conversion Platform</p>
      <nav class="app-nav">
        <button id="nav-mine" class="nav-btn active">Mine</button>
        <button id="nav-convert" class="nav-btn">Convert</button>
        <button id="pwa-install-btn" class="nav-btn pwa-btn" style="display:none;">Download PWA</button>
      </nav>
    </header>

    <main class="app-content">
      <!-- Mine View -->
      <section id="view-mine" class="view-section active">
        <div class="card">
          <h2>Mining Dashboard</h2>
          <p>Auto-generating secure base64 identities and encrypted mining keys.</p>
          <div class="metrics-grid">
            <div class="metric-box">
              <span class="metric-label">Miner Identity Email (Base64)</span>
              <code id="metric-email" class="metric-value">Initializing...</code>
            </div>
            <div class="metric-box">
              <span class="metric-label">Base64 Key Value</span>
              <code id="metric-key" class="metric-value">Initializing...</code>
            </div>
            <div class="metric-box">
              <span class="metric-label">Current Blab Hash ([blab])</span>
              <code id="metric-blab" class="metric-value">Waiting for hash...</code>
            </div>
          </div>
          <div class="action-group">
            <button id="btn-toggle-mining" class="btn btn-primary">Stop Mining</button>
          </div>
        </div>

        <div class="card">
          <h3>Live Mining Feed Terminal</h3>
          <div id="terminal-feed" class="terminal">
            <div class="terminal-line">[System] BitMiner core initialized. Starting miner loop...</div>
          </div>
        </div>
      </section>

      <!-- Convert View -->
      <section id="view-convert" class="view-section">
        <div class="card">
          <h2>Blab Data Conversion</h2>
          <p>Process mined data and convert [blab] tokens using your selected amount and miner identity.</p>
          
          <div class="form-group">
            <label for="convert-email">Miner Identity Email ([miner_identity_email]):</label>
            <input type="text" id="convert-email" class="input-field" readonly />
          </div>

          <div class="form-group">
            <label for="convert-amount">App User Selected Amount ([app_user_selected_amount]):</label>
            <input type="number" id="convert-amount" class="input-field" value="100" min="1" step="1" />
          </div>

          <div class="form-group">
            <label for="convert-blab">Target Blab Hash ([blab]):</label>
            <input type="text" id="convert-blab" class="input-field" placeholder="e.g., blab_9f83a..." />
          </div>

          <button id="btn-execute-conversion" class="btn btn-success">Process Conversion</button>
        </div>

        <div class="card">
          <h3>Conversion Output Terminal</h3>
          <div id="conversion-terminal" class="terminal">
            <div class="terminal-line">[System] Ready for conversion processing.</div>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; I.T. Skokos — BitMiner v1.0.0. All rights reserved.</p>
    </footer>
  </div>
`;

// Application Logic
let isMining = true;
let currentBlab = '';
let currentEmailB64 = '';
let currentKeyB64 = '';

function generateBase64Email() {
  const randomUser = 'miner_' + Math.random().toString(36.substring(2, 9));
  const email = `${randomUser}@bitminer.io`;
  return btoa(email);
}

function generateBase64Key() {
  const rawKey = 'key_' + Math.random().toString(36) + '_' + Date.now();
  return btoa(rawKey);
}

function updateIdentity() {
  currentEmailB64 = generateBase64Email();
  currentKeyB64 = generateBase64Key();
  currentBlab = 'blab_' + Math.random().toString(36).substring(2, 10);

  document.getElementById('metric-email').innerText = currentEmailB64;
  document.getElementById('metric-key').innerText = currentKeyB64;
  document.getElementById('metric-blab').innerText = currentBlab;
  document.getElementById('convert-email').value = currentEmailB64;
  document.getElementById('convert-blab').value = currentBlab;
}

updateIdentity();

// Terminal logger
function logToTerminal(message, isConversion = false) {
  const termId = isConversion ? 'conversion-terminal' : 'terminal-feed';
  const term = document.getElementById(termId);
  if (!term) return;
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerText = `[${new.target ? '' : new Date().toLocaleTimeString()}] ${message}`;
  term.appendChild(line);
  term.scrollTop = term.scrollHeight;
}

// Mining simulation loop
setInterval(() => {
  if (!isMining) return;
  currentBlab = 'blab_' + Math.random().toString(36).substring(2, 10);
  const blabEl = document.getElementById('metric-blab');
  if (blabEl) blabEl.innerText = currentBlab;
  const convertBlabInput = document.getElementById('convert-blab');
  if (convertBlabInput && !convertBlabInput.value) {
    convertBlabInput.value = currentBlab;
  }
  logToTerminal(`Mined new block segment -> [blab]: ${currentBlab} | Identity: ${currentEmailB64.substring(0, 10)}...`);
}, 4000);

// Navigation tabs
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

// Toggle mining button
const btnToggle = document.getElementById('btn-toggle-mining');
btnToggle.addEventListener('click', () => {
  isMining = !isMining;
  btnToggle.innerText = isMining ? 'Stop Mining' : 'Resume Mining';
  btnToggle.className = isMining ? 'btn btn-primary' : 'btn btn-warning';
  logToTerminal(isMining ? 'Mining resumed by user.' : 'Mining paused by user.');
});

// Conversion execution with core variables: [blab], [miner_identity_email], [app_user_selected_amount]
const btnExecuteConversion = document.getElementById('btn-execute-conversion');
btnExecuteConversion.addEventListener('click', () => {
  const miner_identity_email = document.getElementById('convert-email').value;
  const app_user_selected_amount = parseFloat(document.getElementById('convert-amount').value) || 0;
  const blab = document.getElementById('convert-blab').value;

  if (!blab || !miner_identity_email) {
    alert('Missing required variables for conversion.');
    return;
  }

  logToTerminal(`Initiating conversion for [miner_identity_email]: ${miner_identity_email}`, true);
  logToTerminal(`Processing [blab]: ${blab} with [app_user_selected_amount]: ${app_user_selected_amount}`, true);

  setTimeout(() => {
    const conversionResult = (app_user_selected_amount * 0.00142).toFixed(6);
    logToTerminal(`SUCCESS: Converted ${app_user_selected_amount} units of [blab] for ${atob(miner_identity_email)}. Output: ${conversionResult} BTC equivalent.`, true);
  }, 600);
});

// PWA install prompt handler
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    });
  }
});

console.log('BitMiner application initialized successfully');
