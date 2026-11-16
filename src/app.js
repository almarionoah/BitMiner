export function initApp(container) {
  container.innerHTML = `
    <div class="app-container">
      <header>
        <div class="logo">⚡ BitMiner</div>
        <nav>
          <button class="nav-btn active" data-target="mine-view">Mine</button>
          <button class="nav-btn" data-target="convert-view">Convert</button>
        </nav>
      </header>

      <main>
        <section id="mine-view" class="view-container active">
          <div class="grid-2">
            <div class="card">
              <h2 style="margin-bottom: 1rem;">Miner Node Control</h2>
              <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Auto-generate cryptographic credentials and mine blabs in real-time.</p>
              
              <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                  <label class="stat-label">Identity Email (Base64)</label>
                  <input type="text" id="miner-email-input" readonly placeholder="Click Start Mining..." />
                </div>
                <div>
                  <label class="stat-label">Generated Key (Base64)</label>
                  <input type="text" id="miner-key-input" readonly placeholder="Waiting for key generation..." />
                </div>
              </div>

              <div style="display: flex; gap: 1rem;">
                <button id="toggle-mine-btn" class="btn">Start Mining</button>
                <button id="reset-mine-btn" class="btn btn-secondary">Reset</button>
              </div>
            </div>

            <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
              <h2>Mining Performance</h2>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">Hash Rate</div>
                  <div class="stat-value" id="hash-rate">0.00 H/s</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Mined Blabs</div>
                  <div class="stat-value" id="mined-count">0</div>
                </div>
              </div>
              <div style="margin-top: auto;">
                <label class="stat-label" style="margin-bottom: 0.5rem; display: block;">Live Feed Terminal</label>
                <div class="terminal" id="mine-terminal">
                  <div class="terminal-line">[System] Miner ready. Awaiting activation...</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="convert-view" class="view-container">
          <div class="grid-2">
            <div class="card">
              <h2 style="margin-bottom: 1rem;">Blab Conversion Hub</h2>
              <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Convert mined data streams using core parameters [blab], [miner_identity_email], and [app_user_selected_amount].</p>
              
              <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                  <label class="stat-label">Target Miner Email</label>
                  <input type="text" id="convert-email-input" placeholder="miner@it-skokos.com" value="miner@it-skokos.com" />
                </div>
                <div>
                  <label class="stat-label">Selected Amount ([app_user_selected_amount])</label>
                  <input type="number" id="convert-amount-input" value="100" min="1" max="100000" />
                </div>
                <div>
                  <label class="stat-label">Active Blab Stream ([blab])</label>
                  <select id="convert-blab-select">
                    <option value="">Select a mined blab...</option>
                  </select>
                </div>
              </div>

              <button id="process-conversion-btn" class="btn">Process Conversion</button>
            </div>

            <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
              <h2>Conversion Terminal Output</h2>
              <div class="terminal" id="convert-terminal">
                <div class="terminal-line">[System] Conversion engine online. Ready for processing...</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;

  setupNavigation();
  setupMiningEngine();
}

function setupNavigation() {
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const target = btn.getAttribute('data-target');
      document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');
    });
  });
}

let isMining = false;
let mineInterval = null;
const minedBlabs = [];

function setupMiningEngine() {
  const toggleBtn = document.getElementById('toggle-mine-btn');
  const resetBtn = document.getElementById('reset-mine-btn');
  const emailInput = document.getElementById('miner-email-input');
  const keyInput = document.getElementById('miner-key-input');
  const hashRateEl = document.getElementById('hash-rate');
  const minedCountEl = document.getElementById('mined-count');
  const terminal = document.getElementById('mine-terminal');
  
  const convertTerminal = document.getElementById('convert-terminal');
  const convertBlabSelect = document.getElementById('convert-blab-select');
  const convertBtn = document.getElementById('process-conversion-btn');

  toggleBtn.addEventListener('click', () => {
    isMining = !isMining;
    if (isMining) {
      toggleBtn.textContent = 'Stop Mining';
      toggleBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      
      const rawEmail = `miner_${Math.random().toString(36.substring(2, 9))}@it-skokos.com`;
      const miner_identity_email = btoa(rawEmail);
      const miner_key = btoa(Math.random().toString());
      
      emailInput.value = miner_identity_email;
      keyInput.value = miner_key;
      
      appendTerminal(terminal, `[Init] Miner Identity Generated: ${miner_identity_email}`);
      appendTerminal(terminal, `[Init] Cryptographic Key Established.`);

      mineInterval = setInterval(() => {
        const blab = btoa(`blab_block_${Date.now()}_${Math.random()}`);
        minedBlabs.push(blab);
        
        minedCountEl.textContent = minedBlabs.length;
        hashRateEl.textContent = (Math.random() * 50 + 120).toFixed(2) + ' H/s';
        
        appendTerminal(terminal, `[Mined] Blab token: ${blab}`);
        updateBlabSelect(convertBlabSelect, minedBlabs);
      }, 3000);
    } else {
      stopMining(toggleBtn, hashRateEl);
    }
  });

  resetBtn.addEventListener('click', () => {
    stopMining(toggleBtn, hashRateEl);
    isMining = false;
    minedBlabs.length = 0;
    emailInput.value = '';
    keyInput.value = '';
    minedCountEl.textContent = '0';
    terminal.innerHTML = '<div class="terminal-line">[System] Miner reset. Awaiting activation...</div>';
    updateBlabSelect(convertBlabSelect, minedBlabs);
  });

  convertBtn.addEventListener('click', () => {
    const miner_identity_email = document.getElementById('convert-email-input').value;
    const app_user_selected_amount = document.getElementById('convert-amount-input').value;
    const blab = convertBlabSelect.value;

    if (!blab) {
      appendTerminal(convertTerminal, '[Error] Please select a valid [blab] token for conversion.');
      return;
    }

    if (!miner_identity_email) {
      appendTerminal(convertTerminal, '[Error] [miner_identity_email] is required.');
      return;
    }

    const conversionResult = btoa(`${miner_identity_email}:${blab}:${app_user_selected_amount}`);
    appendTerminal(convertTerminal, `[Conversion Success] Executed for Email: ${miner_identity_email} | Amount: ${app_user_selected_amount} | Blab: ${blab.substring(0, 12)}...`);
    appendTerminal(convertTerminal, `[Output Payload] ${conversionResult}`);
  });
}

function stopMining(toggleBtn, hashRateEl) {
  if (mineInterval) clearInterval(mineInterval);
  toggleBtn.textContent = 'Start Mining';
  toggleBtn.style.background = '';
  hashRateEl.textContent = '0.00 H/s';
}

function appendTerminal(terminalEl, message) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = message;
  terminalEl.appendChild(line);
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

function updateBlabSelect(selectEl, blabs) {
  selectEl.innerHTML = '<option value="">Select a mined blab...</option>';
  blabs.forEach(blab => {
    const opt = document.createElement('option');
    opt.value = blab;
    opt.textContent = `${blab.substring(0, 24)}...`;
    selectEl.appendChild(opt);
  });
}
