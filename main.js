import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <header>
    <div class="logo">BitMiner</div>
    <nav>
      <button id="nav-mine" class="active">Mine</button>
      <button id="nav-convert">Convert</button>
    </nav>
  </header>
  <main>
    <section id="view-mine" class="view active">
      <div class="stats-grid">
        <div class="stat-card">
          <p>Mining Status</p>
          <div class="stat-value" id="status-text">Idle</div>
        </div>
        <div class="stat-card">
          <p>Generated Blabs</p>
          <div class="stat-value" id="blab-count">0</div>
        </div>
      </div>
      <div class="card">
        <h1>Cryptocurrency Miner</h1>
        <p>Auto-generate valid base64 encrypted email addresses and cryptographic key values for conversion processing.</p>
        <button id="btn-toggle-mine" class="btn">Start Mining</button>
      </div>
      <div class="card">
        <h2>Mining Feed Terminal</h2>
        <div id="mine-terminal" class="terminal">
          <div class="terminal-line">[System] BitMiner initialized successfully. Ready to mine base64 blabs.</div>
        </div>
      </div>
    </section>

    <section id="view-convert" class="view">
      <div class="card">
        <h1>Conversion Processor</h1>
        <p>Process generated base64 blabs and email payloads. Outputs are automatically dispatched to the feed terminal.</p>
        <div class="input-group">
          <label for="convert-email">Target Email Address</label>
          <input type="email" id="convert-email" placeholder="user@example.com" value="miner@bitminer.io" />
        </div>
        <button id="btn-process-convert" class="btn">Process Conversion</button>
      </div>
      <div class="card">
        <h2>Conversion Feed Terminal</h2>
        <div id="convert-terminal" class="terminal">
          <div class="terminal-line">[System] Conversion engine online. Awaiting conversion triggers.</div>
        </div>
      </div>
    </section>
  </main>
`;

// Navigation logic
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

// Mining & Conversion State
let isMining = false;
let miningInterval = null;
let blabCount = 0;
let generatedBlabs = [];

const statusText = document.getElementById('status-text');
const blabCountEl = document.getElementById('blab-count');
const btnToggleMine = document.getElementById('btn-toggle-mine');
const mineTerminal = document.getElementById('mine-terminal');
const convertTerminal = document.getElementById('convert-terminal');
const btnProcessConvert = document.getElementById('btn-process-convert');
const convertEmailInput = document.getElementById('convert-email');

function logToTerminal(terminalEl, message) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  terminalEl.appendChild(line);
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

function generateBase64Blab() {
  const randomEmail = `miner_${Math.random().toString(36.substring(2, 9))}@bitminer.net`;
  const emailB64 = btoa(randomEmail);
  const keyBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const keyB64 = btoa(String.fromCharCode(...keyBytes));
  return { emailB64, keyB64, combined: `${emailB64}.${keyB64}` };
}

btnToggleMine.addEventListener('click', () => {
  isMining = !isMining;
  if (isMining) {
    btnToggleMine.textContent = 'Stop Mining';
    statusText.textContent = 'Mining...';
    logToTerminal(mineTerminal, 'Mining process started. Generating base64 blabs...');
    
    miningInterval = setInterval(() => {
      const blab = generateBase64Blab();
      generatedBlabs.push(blab);
      blabCount++;
      blabCountEl.textContent = blabCount;
      logToTerminal(mineTerminal, `Mined Base64 Email: ${blab.emailB64}`);
      logToTerminal(mineTerminal, `Mined Base64 Key: ${blab.keyB64}`);
    }, 3000);
  } else {
    btnToggleMine.textContent = 'Start Mining';
    statusText.textContent = 'Idle';
    clearInterval(miningInterval);
    logToTerminal(mineTerminal, 'Mining process paused.');
  }
});

btnProcessConvert.addEventListener('click', () => {
  const email = convertEmailInput.value || 'default@bitminer.io';
  const emailB64 = btoa(email);
  
  logToTerminal(convertTerminal, `Initiating conversion processing for email: ${email} (${emailB64})`);
  
  if (generatedBlabs.length === 0) {
    const fallbackBlab = generateBase64Blab();
    generatedBlabs.push(fallbackBlab);
  }
  
  generatedBlabs.forEach((blab, index) => {
    setTimeout(() => {
      const processedOutput = btoa(`CONVERTED:${blab.combined}:${emailB64}`);
      logToTerminal(convertTerminal, `[Conversion #${index + 1}] Base64 Blab Processed: ${blab.combined}`);
      logToTerminal(convertTerminal, `[Conversion #${index + 1}] Output Result: ${processedOutput}`);
    }, index * 400);
  });
});
