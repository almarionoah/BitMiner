export function initMiner() {
  const startBtn = document.getElementById('start-mining-btn');
  const statusDiv = document.getElementById('mining-status');
  const terminal = document.getElementById('feed-terminal');

  if (!startBtn) return;

  let miningInterval = null;

  startBtn.addEventListener('click', () => {
    if (miningInterval) {
      clearInterval(miningInterval);
      miningInterval = null;
      startBtn.textContent = 'Start Mining Session';
      statusDiv.textContent = 'Status: Stopped';
      return;
    }

    startBtn.textContent = 'Stop Mining';
    statusDiv.textContent = 'Status: Mining Active...';

    // Auto generate valid email address in base64 encryption
    const rawEmail = `miner_${Math.random().toString(36).substring(2, 8)}@bitminer.io`;
    const miner_identity_email = btoa(rawEmail);
    const base64Key = btoa(Math.random().toString(36) * 1e15);

    terminal.innerHTML += `<div>[${new Date().toISOString()}] Identity Email Generated: ${miner_identity_email}</div>`;
    terminal.innerHTML += `<div>[${new Date().toISOString()}] Base64 Key Generated: ${base64Key}</div>`;

    let counter = 1;
    miningInterval = setInterval(() => {
      const blab = btoa(`blab_payload_${counter++}_${Date.now()}`);
      const app_user_selected_amount = Math.floor(Math.random() * 500) + 50;

      terminal.innerHTML += `<div>[Mined] blab: ${blab} | email: ${miner_identity_email} | amount: ${app_user_selected_amount}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
    }, 2000);
  });
}
