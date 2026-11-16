import { initMiner } from './miner.js';

const app = document.getElementById('app');

function renderLayout() {
  app.innerHTML = `
    <header>
      <h1>BitMiner Terminal</h1>
      <nav>
        <button id="nav-mine" class="active">Mine</button>
        <button id="nav-convert">Convert</button>
      </nav>
    </header>
    <main id="view-container">
    </main>
    <div class="pwa-banner">
      BitMiner v1.0.0 — PWA Ready &bull; <span id="pwa-status">Online</span>
    </div>
  `;

  document.getElementById('nav-mine').addEventListener('click', () => switchTab('mine'));
  document.getElementById('nav-convert').addEventListener('click', () => switchTab('convert'));

  switchTab('mine');
}

function switchTab(tab) {
  const mineBtn = document.getElementById('nav-mine');
  const convertBtn = document.getElementById('nav-convert');
  const container = document.getElementById('view-container');

  if (tab === 'mine') {
    mineBtn.classList.add('active');
    convertBtn.classList.remove('active');
    container.innerHTML = `
      <div class="card">
        <h2>Cryptocurrency Miner</h2>
        <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">
          Auto-generates encrypted identity credentials and mines data streams in real-time.
        </p>
        <button id="start-mining-btn" class="btn-primary">Start Mining Session</button>
        <div id="mining-status" style="margin-top: 1rem; font-weight: 500;">Status: Idle</div>
      </div>
      <div class="card">
        <h3>Live Feed Terminal</h3>
        <div id="feed-terminal" class="terminal">
          <div>[System] Initialized BitMiner secure terminal...</div>
        </div>
      </div>
    `;
    initMiner();
  } else {
    convertBtn.classList.add('active');
    mineBtn.classList.remove('active');
    container.innerHTML = `
      <div class="card">
        <h2>Data Conversion Engine</h2>
        <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">
          Process mined blabs with designated email identity and selected conversion amounts.
        </p>
        <label for="conv-email">Miner Identity Email (Base64 / Plain)</label>
        <input type="text" id="conv-email" placeholder="miner@bitminer.io" />
        
        <label for="conv-amount">App User Selected Amount ([app_user_selected_amount])</label>
        <input type="number" id="conv-amount" value="100" min="1" />

        <label for="conv-blab">Blab Data String ([blab])</label>
        <input type="text" id="conv-blab" placeholder="bWluZXJfYmxhYl9kYXRhX3N0cmVhbQ==" />

        <button id="run-convert-btn" class="btn-primary">Execute Conversion</button>
      </div>
      <div class="card">
        <h3>Conversion Output Feed</h3>
        <div id="conversion-terminal" class="terminal">
          <div>[System] Ready for conversion processing...</div>
        </div>
      </div>
    ";

    const runBtn = document.getElementById('run-convert-btn');
    runBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('conv-email').value || 'miner@bitminer.io';
      const amountInput = document.getElementById('conv-amount').value || '100';
      const blabInput = document.getElementById('conv-blab').value || 'bWluZXJfaW5wdXRfYmxhYg==';

      const miner_identity_email = btoa(emailInput);
      const app_user_selected_amount = amountInput;
      const blab = btoa(blabInput);

      const term = document.getElementById('conversion-terminal');
      const timestamp = new Date().toISOString();
      
      term.innerHTML += `<div>[${timestamp}] CONVERTING -> Email: ${miner_identity_email} | Amount: ${app_user_selected_amount} | Blab: ${blab}</div>`;
      term.scrollTop = term.scrollHeight;
    });
  }
}

renderLayout();
