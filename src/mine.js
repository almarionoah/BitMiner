export function renderMineView(container) {
  container.innerHTML = `
    <div class="card">
      <h2>Cryptocurrency Mining Rig</h2>
      <p>Initiate mining protocols to auto-generate secure base64 encrypted wallet credentials and reward keys.</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Status</div>
          <div class="stat-value" id="mining-status">Idle</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Hash Rate</div>
          <div class="stat-value" id="hash-rate">0 H/s</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Mined Blocks</div>
          <div class="stat-value" id="mined-blocks">0</div>
        </div>
      </div>

      <button class="btn-primary" id="start-mining-btn">Start Mining Session</button>

      <div id="results-section" style="display: none; margin-top: 1.5rem;">
        <h3>Generated Credentials</h3>
        
        <div style="margin-top: 1rem;">
          <label>Encrypted Email Address (Base64):</label>
          <div class="output-box" id="encrypted-email">-</div>
        </div>

        <div style="margin-top: 1rem;">
          <label>Generated Base64 Key Value:</label>
          <div class="output-box" id="base64-key">-</div>
        </div>
      </div>
    </div>
  `;

  const startBtn = container.querySelector('#start-mining-btn');
  const statusEl = container.querySelector('#mining-status');
  const hashRateEl = container.querySelector('#hash-rate');
  const blocksEl = container.querySelector('#mined-blocks');
  const resultsSection = container.querySelector('#results-section');
  const emailOutput = container.querySelector('#encrypted-email');
  const keyOutput = container.querySelector('#base64-key');

  let isMining = false;
  let blocks = 0;

  startBtn.addEventListener('click', () => {
    if (isMining) return;
    isMining = true;
    startBtn.textContent = 'Mining in Progress...';
    startBtn.disabled = true;
    statusEl.textContent = 'Active';
    hashRateEl.textContent = '1,420 H/s';

    setTimeout(() => {
      blocks++;
      blocksEl.textContent = blocks;
      statusEl.textContent = 'Completed';
      hashRateEl.textContent = '0 H/s';
      startBtn.textContent = 'Start Mining Session';
      startBtn.disabled = false;
      isMining = false;

      // Generate valid email address in base64 encryption & base64 key value
      const randomNames = ['miner', 'crypto', 'hash', 'node', 'block', 'satoshi'];
      const randomDomains = ['bitminer.io', 'crypto.net', 'chain.org', 'mining.co'];
      const rawEmail = `${randomNames[Math.floor(Math.random() * randomNames.length)]}_${Math.floor(Math.random() * 9000 + 1000)}@${randomDomains[Math.floor(Math.random() * randomDomains.length)]}`;
      
      const encryptedEmail = btoa(rawEmail);
      
      const randomBytes = new Uint8Array(24);
      window.crypto.getRandomValues(randomBytes);
      const base64Key = btoa(String.fromCharCode(...randomBytes));

      emailOutput.textContent = encryptedEmail;
      keyOutput.textContent = base64Key;
      resultsSection.style.display = 'block';
    }, 2000);
  });
}
