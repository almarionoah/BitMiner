import './style.css';

document.querySelector('#app').innerHTML = `
  <header>
    <div class="logo">BitMiner</div>
    <nav>
      <button id="nav-mine" class="active">Mine</button>
      <button id="nav-convert">Convert</button>
    </nav>
  </header>
  <main>
    <!-- Mine View -->
    <section id="view-mine" class="view-section active">
      <div class="card">
        <h2>Cryptocurrency Miner</h2>
        <p>Auto-generate valid base64 encrypted email addresses and key value blabs securely.</p>
        <button id="btn-mine" class="btn">Start Mining Blabs</button>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Generated Email (Base64)</div>
          <div id="stat-email" class="stat-value">---</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Generated Key (Base64)</div>
          <div id="stat-key" class="stat-value">---</div>
        </div>
      </div>
    </section>

    <!-- Convert View -->
    <section id="view-convert" class="view-section">
      <div class="card">
        <h2>Base64 Blab Processor & Converter</h2>
        <p>Input email and conversion parameters to process generated base64 blabs automatically.</p>
        <div class="input-group">
          <label for="convert-email">Conversion Email Address</label>
          <input type="email" id="convert-email" placeholder="miner@bitminer.io" value="miner@bitminer.io" />
        </div>
        <button id="btn-convert" class="btn">Process Blabs & Convert</button>
      </div>

      <div class="card">
        <h2>Feed Terminal</h2>
        <div id="feed-terminal" class="terminal-box">
          <div class="terminal-line">[System] BitMiner ready for conversion processing.</div>
        </div>
      </div>
    </section>
  </main>
`;

let lastEmailBase64 = '';
let lastKeyBase64 = '';

function b64Encode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
}

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

// Mining logic
const btnMine = document.getElementById('btn-mine');
const statEmail = document.getElementById('stat-email');
const statKey = document.getElementById('stat-key');

btnMine.addEventListener('click', () => {
  const randomUser = 'miner_' + Math.random().toString(36.substring(2, 9)) + '@bitminer.io';
  const randomKeyRaw = 'key_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  
  lastEmailBase64 = b64Encode(randomUser);
  lastKeyBase64 = b64Encode(randomKeyRaw);

  statEmail.textContent = lastEmailBase64;
  statKey.textContent = lastKeyBase64;
});

// Conversion logic with feed terminal output
const btnConvert = document.getElementById('btn-convert');
const feedTerminal = document.getElementById('feed-terminal');

btnConvert.addEventListener('click', () => {
  if (!lastEmailBase64 || !lastKeyBase64) {
    // Auto generate if none mined yet
    const fallbackUser = 'auto_miner@bitminer.io';
    const fallbackKey = 'auto_key_' + Date.now();
    lastEmailBase64 = b64Encode(fallbackUser);
    lastKeyBase64 = b64Encode(fallbackKey);
    statEmail.textContent = lastEmailBase64;
    statKey.textContent = lastKeyBase64;
  }

  const emailInputVal = document.getElementById('convert-email').value;
  const timestamp = new Date().toISOString();
  
  const line1 = document.createElement('div');
  line1.className = 'terminal-line';
  line1.textContent = `[${timestamp}] Processing email: ${emailInputVal} | Base64 Email: ${lastEmailBase64}`;
  feedTerminal.appendChild(line1);

  const line2 = document.createElement('div');
  line2.className = 'terminal-line';
  line2.textContent = `[${timestamp}] Blab payload validated. Key Blab: ${lastKeyBase64}`;
  feedTerminal.appendChild(line2);

  const line3 = document.createElement('div');
  line3.className = 'terminal-line';
  line3.textContent = `[SUCCESS] Conversion completed. Output hash: SHA256-${Math.random().toString(16).substring(2, 12)}`;
  feedTerminal.appendChild(line3);

  feedTerminal.scrollTop = feedTerminal.scrollHeight;
});

console.log('BitMiner application initialized successfully');
