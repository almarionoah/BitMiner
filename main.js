import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex flex-col">
    <!-- Header -->
    <header class="border-b border-indigo-900/50 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
            ₿
          </div>
          <div>
            <h1 class="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">BITMINER</h1>
            <p class="text-xs text-slate-400">Decrypted Mining & Conversion Protocol</p>
          </div>
        </div>
        <nav class="flex space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-indigo-500/20">
          <button id="tab-mine" class="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30">
            Mine
          </button>
          <button id="tab-convert" class="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800">
            Convert
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left / Main Panel -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Mine View -->
        <div id="view-mine" class="space-y-6">
          <div class="bg-slate-900/80 backdrop-blur border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-lg font-bold text-slate-100">Mining Rig Control</h2>
                <p class="text-xs text-slate-400">Generate base64 cryptographic blocks and identities</p>
              </div>
              <div id="mining-status" class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Idle
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span class="text-xs text-slate-400 block mb-1">Auto-Generated Miner Identity Email ([miner_identity_email])</span>
                <div id="display-email" class="font-mono text-sm text-cyan-300 truncate">Not generated</div>
              </div>
              <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span class="text-xs text-slate-400 block mb-1">Base64 Key Value</span>
                <div id="display-key" class="font-mono text-sm text-fuchsia-300 truncate">Not generated</div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button id="btn-start-mining" class="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 transition-all">
                Start Mining [blab]
              </button>
              <button id="btn-stop-mining" class="px-6 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
                Stop
              </button>
            </div>
          </div>

          <!-- Terminal Feed -->
          <div class="bg-slate-950 border border-indigo-900/40 rounded-2xl p-5 shadow-inner">
            <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-900">
              <span class="text-xs font-mono uppercase tracking-wider text-indigo-400">Feed Terminal output</span>
              <button id="btn-clear-terminal" class="text-xs text-slate-500 hover:text-slate-300">Clear</button>
            </div>
            <div id="terminal-output" class="font-mono text-xs space-y-2 h-64 overflow-y-auto pr-2 text-slate-300">
              <div class="text-slate-500">System initialized. Ready to mine base64 blabs...</div>
            </div>
          </div>
        </div>

        <!-- Convert View -->
        <div id="view-convert" class="space-y-6 hidden">
          <div class="bg-slate-900/80 backdrop-blur border border-indigo-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 class="text-lg font-bold text-slate-100 mb-1">Conversion Processing Hub</h2>
            <p class="text-xs text-slate-400 mb-6">Convert mined data using [blab], [miner_identity_email], and [app_user_selected_amount]</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Conversion Amount ([app_user_selected_amount])</label>
                <input type="number" id="input-amount" value="1.0" step="0.1" min="0.1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Target Miner Email ([miner_identity_email])</label>
                <input type="text" id="input-email-target" placeholder="Select or enter base64 email" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Blab Source Data ([blab])</label>
                <textarea id="input-blab-target" rows="3" placeholder="Base64 blab string..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"></textarea>
              </div>
              <button id="btn-execute-conversion" class="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all">
                Execute Conversion Process
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-6">
        <div class="bg-slate-900/80 backdrop-blur border border-indigo-500/20 rounded-2xl p-6 shadow-2xl">
          <h3 class="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Stats Overview</h3>
          <div class="space-y-4">
            <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span class="text-xs text-slate-400 block">Total Mined Blabs</span>
                <span id="stat-mined-count" class="text-lg font-bold text-cyan-400 font-mono">0</span>
              </div>
              <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">📦</div>
            </div>
            <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span class="text-xs text-slate-400 block">Converted Amount</span>
                <span id="stat-converted-sum" class="text-lg font-bold text-emerald-400 font-mono">0.00</span>
              </div>
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">⚡</div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-indigo-900/40 via-slate-900/80 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl">
          <h3 class="text-sm font-bold text-slate-200 mb-2">PWA Download Ready</h3>
          <p class="text-xs text-slate-400 mb-4">Install BitMiner as a standalone application on your device for optimized mining performance.</p>
          <button id="btn-install-pwa" class="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all">
            Install App PWA
          </button>
        </div>
      </div>
    </main>
  </div>
`;

// App state
let miningInterval = null;
let minedCount = 0;
let convertedSum = 0;
let currentEmail = '';
let currentKey = '';
let currentBlab = '';

// Tab switching
const tabMine = document.getElementById('tab-mine');
const tabConvert = document.getElementById('tab-convert');
const viewMine = document.getElementById('view-mine');
const viewConvert = document.getElementById('view-convert');

tabMine.addEventListener('click', () => {
  tabMine.className = 'px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30';
  tabConvert.className = 'px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800';
  viewMine.classList.remove('hidden');
  viewConvert.classList.add('hidden');
});

tabConvert.addEventListener('click', () => {
  tabConvert.className = 'px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30';
  tabMine.className = 'px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800';
  viewConvert.classList.remove('hidden');
  viewMine.classList.add('hidden');
  
  if (currentEmail) document.getElementById('input-email-target').value = currentEmail;
  if (currentBlab) document.getElementById('input-blab-target').value = currentBlab;
});

// Terminal logger
function logTerminal(message, type = 'info') {
  const terminal = document.getElementById('terminal-output');
  const time = new Date().toLocaleTimeString();
  const colorClass = type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-rose-400' : 'text-cyan-300';
  terminal.innerHTML += `<div class="flex gap-2"><span class="text-slate-600">[${time}]</span><span class="${colorClass}">${message}</span></div>`;
  terminal.scrollTop = terminal.scrollHeight;
}

document.getElementById('btn-clear-terminal').addEventListener('click', () => {
  document.getElementById('terminal-output
').innerHTML = '';
});

// Mining logic
function generateMinerIdentity() {
  const rawEmail = `miner_${Math.random().toString(36).substring(2, 9)}@bitminer.io`;
  return btoa(rawEmail);
}

function generateBase64Key() {
  const buffer = new Uint8Array(16);
  window.crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode(...buffer));
}

function generateBlab() {
  const data = `blab_payload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return btoa(data);
}

function processAutoConversion(blab, miner_identity_email, app_user_selected_amount) {
  const resultValue = (app_user_selected_amount * 1.414).toFixed(4);
  logTerminal(`AUTO-CONVERT: [blab]=${blab.substring(0, 10)}... | [miner_identity_email]=${miner_identity_email.substring(0, 10)}... | [app_user_selected_amount]=${app_user_selected_amount} -> Yield: ${resultValue} BTC`, 'success');
  convertedSum += parseFloat(app_user_selected_amount);
  document.getElementById('stat-converted-sum').textContent = convertedSum.toFixed(2);
}

document.getElementById('btn-start-mining').addEventListener('click', () => {
  if (miningInterval) return;
  document.getElementById('mining-status').className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5';
  document.getElementById('mining-status').innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>Mining Active';
  logTerminal('Mining rig initiated...', 'info');

  currentEmail = generateMinerIdentity();
  currentKey = generateBase64Key();
  document.getElementById('display-email').textContent = currentEmail;
  document.getElementById('display-key').textContent = currentKey;

  miningInterval = setInterval(() => {
    currentBlab = generateBlab();
    minedCount++;
    document.getElementById('stat-mined-count').textContent = minedCount;
    logTerminal(`Mined new [blab]: ${currentBlab}`, 'info');

    const defaultAmount = parseFloat(document.getElementById('input-amount').value) || 1.0;
    processAutoConversion(currentBlab, currentEmail, defaultAmount);
  }, 4000);
});

document.getElementById('btn-stop-mining').addEventListener('click', () => {
  if (miningInterval) {
    clearInterval(miningInterval);
    miningInterval = null;
    document.getElementById('mining-status').className = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5';
    document.getElementById('mining-status').innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span>Paused';
    logTerminal('Mining rig paused.', 'error');
  }
});

// Manual conversion button
document.getElementById('btn-execute-conversion').addEventListener('click', () => {
  const app_user_selected_amount = parseFloat(document.getElementById('input-amount').value) || 1.0;
  const miner_identity_email = document.getElementById('input-email-target').value || currentEmail || generateMinerIdentity();
  const blab = document.getElementById('input-blab-target').value || currentBlab || generateBlab();

  logTerminal(`Manual conversion executed for [blab]=${blab.substring(0, 10)}... with [app_user_selected_amount]=${app_user_selected_amount}`, 'success');
  convertedSum += app_user_selected_amount;
  document.getElementById('stat-converted-sum').textContent = convertedSum.toFixed(2);
});

document.getElementById('btn-install-pwa').addEventListener('click', () => {
  alert('BitMiner PWA is ready for installation. Use your browser menu to Add to Home Screen.');
});
