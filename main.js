import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-container">
    <header>
      <h1>BitMiner v1.0</h1>
      <div class="nav-tabs">
        <button class="tab-btn active" data-target="mine-view">Mine</button>
        <button class="tab-btn" data-target="convert-view">Convert</button>
      </div>
    </header>
    <main>
      <!-- Mine View -->
      <div id="mine-view" class="view active">
        <div class="stats-grid">
          <div class="stat-card">
            <label>Mining Status</label>
            <span id="mining-status" class="stat-value" style="color: #4ade80;">Active</span>
          </div>
          <div class="stat-card">
            <label>Hashes Generated</label>
            <span id="hash-count" class="stat-value">0</span>
          </div>
        </div>
        <div class="form-group">
          <label>Feed Terminal (Auto-Processing)</label>
          <div id="mine-terminal" class="terminal">
            <div class="terminal-line">[System] BitMiner initialized. Ready for mining sequence...</div>
          </div>
        </div>
        <button id="pwa-install-btn" class="btn" style="display:none;">Download / Install PWA</button>
      </div>

      <!-- Convert View -->
      <div id="convert-view" class="view">
        <div class="form-group">
          <label for="convert-email-input">Target Email for Conversion</label>
          <input type="email" id="convert-email-input" placeholder="miner@bitminer.io" value="user@bitminer.io" />
        </div>
        <div class="form-group">
          <label>Conversion Feed & JSON Stream</label>
          <div id="convert-terminal" class="terminal">
            <div class="terminal-line">[System] Enter email and trigger auto-convert stream.</div>
          </div>
        </div>
        <button id="trigger-convert" class="btn">Run Manual Conversion Stream</button>
      </div>
    </main>
  </div>
`;

// Tab switching logic
const tabBtns = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add('active');
  });
});

// Mining & Auto-Convert Logic
let hashCount = 0;
const mineTerminal = document.getElementById('mine-terminal');
const convertTerminal = document.getElementById('convert-terminal');
const hashCountSpan = document.getElementById('hash-count');
const emailInput = document.getElementById('convert-email-input');

function logToTerminal(terminal, message) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

// Auto-mining simulation generating base64 email & base64 key values
setInterval(() => {
  hashCount++;
  hashCountSpan.textContent = hashCount;

  const randomUser = `miner_${Math.floor(Math.random() * 10000)}@bitminer.io`;
  const encodedEmail = btoa(randomUser);
  const randomKey = btoa(Math.random().toString());
  const combinedBase64 = btoa(`${encodedEmail}:${randomKey}`);

  logToTerminal(mineTerminal, `Mined Email Base64: ${encodedEmail}`);
  logToTerminal(mineTerminal, `Generated Key Base64: ${randomKey}`);
  logToTerminal(mineTerminal, `Combined Base64 Hash: ${combinedBase64}`);

  // Auto-convert and populate json datastream
  const targetEmail = emailInput.value || 'default@bitminer.io';
  const targetEncoded = btoa(targetEmail);
  const conversionPayload = JSON.stringify({
    email: targetEmail,
    encodedEmail: targetEncoded,
    combinedHash: combinedBase64,
    timestamp: Date.now()
  });

  logToTerminal(convertTerminal, `Auto-Processed JSON Payload: ${conversionPayload}`);
}, 4000);

document.getElementById('trigger-convert').addEventListener('click', () => {
  const email = emailInput.value || 'test@bitminer.io';
  const encoded = btoa(email);
  const key = btoa(Date.now().toString());
  const finalCombo = btoa(`${encoded}:${key}`);

  logToTerminal(convertTerminal, `Manual conversion processed final base64 combo: ${finalCombo}`);
});

// PWA install prompt handler
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
});
