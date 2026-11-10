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
    
    <main class="app-content">
      <section id="tab-mine" class="tab-section active">
        <div class="card">
          <h2>Cryptocurrency Miner</h2>
          <p>Auto-generating base64 identity email and secure cryptographic key streams.</p>
          <div class="mining-controls">
            <button id="start-mining-btn" class="primary-btn">Start Mining</button>
            <button id="stop-mining-btn" class="secondary-btn" disabled>Stop Mining</button>
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <label>[miner_identity_email]</label>
              <span id="display-email">Not Generated</span>
            </div>
            <div class="stat-box">
              <label>[blab] (Base64 Key)</label>
              <span id="display-blab">Idle...</span>
            </div>
          </div>
        </div>
      </section>

      <section id="tab-convert" class="tab-section">
        <div class="card">
          <h2>Data & Currency Converter</h2>
          <form id="convert-form">
            <div class="form-group">
              <label for="convert-email">[miner_identity_email]</label>
              <input type="text" id="convert-email" placeholder="Base64 Miner Email" required />
            </div>
            <div class="form-group">
              <label for="convert-blab">[blab] String</label>
              <input type="text" id="convert-blab" placeholder="Base64 Blab Stream" required />
            </div>
            <div class="form-group">
              <label for="convert-amount">[app_user_selected_amount]</label>
              <input type="number" id="convert-amount" step="0.01" min="0.01" value="1.00" required />
            </div>
            <button type="submit" class="primary-btn">Process Conversion</button>
          </form>
        </div>
      </section>

      <div class="terminal-card">
        <h3>Feed Terminal</h3>
        <div id="feed-terminal" class="terminal">
          <div class="terminal-line">[System] BitMiner initialized. Ready for operation.</div>
        </div>
      </div>
    </main>
  </div>
`;

// State variables
let miningInterval = null;
let currentBlab = '';
let currentEmail = '';

const navMine = document.getElementById('nav-mine');
const navConvert = document.getElementById('nav-convert');
const tabMine = document.getElementById('tab-mine');
const tabConvert = document.getElementById('tab-convert');
const startMiningBtn = document.getElementById('start-mining-btn');
const stopMiningBtn = document.getElementById('stop-mining-btn');
const displayEmail = document.getElementById('display-email');
const displayBlab = document.getElementById('display-blab');
const feedTerminal = document.getElementById('feed-terminal');
const convertForm = document.getElementById('convert-form');

function logTerminal(message) {
  const timestamp = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = `[${timestamp}] ${message}`;
  feedTerminal.appendChild(line);
  feedTerminal.scrollTop = feedTerminal.scrollHeight;
}

navMine.addEventListener('click', () => {
  navMine.classList.add('active');
  navConvert.classList.remove('active');
  tabMine.classList.add('active');
  tabConvert.classList.remove('active');
});

navConvert.addEventListener('click', () => {
  navConvert.classList.add('active');
  navMine.classList.remove('active');
  tabConvert.classList.add('active');
  tabMine.classList.remove('active');
});

startMiningBtn.addEventListener('click', () => {
  startMiningBtn.disabled = true;
  stopMiningBtn.disabled = false;
  
  // Auto generate valid email in base64 encryption
  const rawEmail = `miner_${Math.random().toString(36.substring(2, 9))}@bitminer.io`;
  currentEmail = btoa(rawEmail);
  displayEmail.textContent = currentEmail;
  logTerminal(`Generated [miner_identity_email]: ${currentEmail}`);

  miningInterval = setInterval(() => {
    // Generate base64 key value [blab]
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(16));
    let binary = '';
    randomBytes.forEach(b => binary += String.fromCharCode(b));
    currentBlab = btoa(binary);
    displayBlab.textContent = currentBlab;
    logTerminal(`Mined new [blab]: ${currentBlab}`);

    // Auto-convert functionality feeding terminal automatically
    const defaultAmount = (Math.random() * 5).toFixed(2);
    logTerminal(`Auto-processing conversion: [blab]=${currentBlab.substring(0, 10)}... | [miner_identity_email]=${currentEmail.substring(0, 8)}... | [app_user_selected_amount]=${defaultAmount}`);
  }, 3000);
});

stopMiningBtn.addEventListener('click', () => {
  clearInterval(miningInterval);
  startMiningBtn.disabled = false;
  stopMiningBtn.disabled = true;
  logTerminal('Mining paused by user.');
});

convertForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailVal = document.getElementById('convert-email').value;
  const blabVal = document.getElementById('convert-blab').value;
  const amountVal = document.getElementById('convert-amount').value;

  logTerminal(`Manual conversion triggered -> [miner_identity_email]: ${emailVal} | [blab]: ${blabVal} | [app_user_selected_amount]: ${amountVal}`);
  alert(`Conversion successful for amount: ${amountVal}! Output dispatched to feed terminal.`);
  convertForm.reset();
});
