import './src/style.css';

document.querySelector('#app').innerHTML = `
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
    <!-- Header / Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <span class="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">BitMiner</span>
        </div>
        <nav class="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button id="nav-mine" class="px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            Mine
          </button>
          <button id="nav-convert" class="px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/60">
            Convert
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Mine View -->
      <div id="view-mine" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Mining Rig Controller -->
          <div class="lg:col-span-1 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Rig Status: <span id="rig-status-text" class="text-emerald-400">Idle</span>
                </h2>
                <span class="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">v1.0.4</span>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">Miner Identity Email</label>
                  <input type="email" id="miner-email" value="miner.node@bitminer.io" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" placeholder="Enter miner email">
                </div>

                <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Generated Blabs:</span>
                    <span id="stat-blabs" class="font-mono text-cyan-400 font-bold">0</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Hash Rate:</span>
                    <span id="stat-hashrate" class="font-mono text-emerald-400 font-bold">0.00 MH/s</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 space-y-3">
              <button id="btn-toggle-mining" class="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all duration-200">
                Start Mining
              </button>
            </div>
          </div>

          <!-- Live Terminal Feed -->
          <div class="lg:col-span-2 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <h3 class="text-sm font-semibold text-slate-200">Live Mining Terminal Feed</h3>
              </div>
              <button id="btn-clear-terminal" class="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 transition-colors">
                Clear Terminal
              </button>
            </div>

            <div id="terminal-feed" class="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-xs text-cyan-400/90 h-[360px] overflow-y-auto space-y-2 border border-slate-800/80">
              <div class="text-slate-500">[System] BitMiner terminal initialized. Ready to mine [blab], [miner_identity_email], and [app_user_selected_amount].</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Convert View -->
      <div id="view-convert" class="hidden space-y-8">
        <div class="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-8 shadow-xl">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-slate-100">Token & Blab Conversion</h2>
            <p class="text-sm text-slate-400 mt-1">Process your mined base64 blabs into verified cryptocurrency assets using custom amounts.</p>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Miner Identity Email ([miner_identity_email])</label>
              <input type="email" id="convert-email" value="miner.node@bitminer.io" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500">
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">App User Selected Amount ([app_user_selected_amount])</label>
              <input type="number" id="convert-amount" value="100.00" step="0.01" min="0.01" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500">
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Latest Mined Blab ([blab])</label>
              <input type="text" id="convert-blab" readonly value="(Start mining to generate blabs)" class="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-400 font-mono focus:outline-none">
            </div>

            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div class="text-xs font-medium text-slate-400">Conversion Summary</div>
              <div id="conversion-output" class="text-xs font-mono text-emerald-400">Awaiting input parameters for conversion calculation...</div>
            </div>

            <button id="btn-execute-conversion" class="w-full py-4 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all duration-200">
              Process Conversion
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 bg-slate-900/40 py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        &copy; ${new Date().getFullYear()} BitMiner Platform. All rights reserved.
      </div>
    </footer>
  </div>
`;

// State Management
let isMining = false;
let miningInterval = null;
let blabCount = 0;
let latestBlab = '';

// DOM Elements
const navMine = document.getElementById('nav-mine');
const navConvert = document.getElementById('nav-convert');
const viewMine = document.getElementById('view-mine');
const viewConvert = document.getElementById('view-convert');

const btnToggleMining = document.getElementById('btn-toggle-mining');
const rigStatusText = document.getElementById('rig-status-text');
const statBlabs = document.getElementById('stat-blabs');
const statHashrate = document.getElementById('stat-hashrate');
const terminalFeed = document.getElementById('terminal-feed');
const btnClearTerminal = document.getElementById('btn-clear-terminal');

const minerEmailInput = document.getElementById('miner-email');
const convertEmailInput = document.getElementById('convert-email');
const convertAmountInput = document.getElementById('convert-amount');
const convertBlabInput = document.getElementById('convert-blab');
const conversionOutput = document.getElementById('conversion-output');
const btnExecuteConversion = document.getElementById('btn-execute-conversion');

// Navigation tabs
navMine.addEventListener('click', () => {
  navMine.className = 'px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20';
  navConvert.className = 'px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/60';
  viewMine.classList.remove('hidden');
  viewConvert.classList.add('hidden');
});

navConvert.addEventListener('click', () => {
  navConvert.className = 'px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20';
  navMine.className = 'px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/60';
  viewConvert.classList.remove('hidden');
  viewMine.classList.add('hidden');
  if (latestBlab) {
    convertBlabInput.value = latestBlab;
  }
  updateConversionPreview();
});

// Terminal logger helper
function logToTerminal(message) {
  const timestamp = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.innerHTML = `<span class="text-slate-500">[${timestamp}]</span> ${message}`;
  terminalFeed.appendChild(div);
  terminalFeed.scrollTop = terminalFeed.scrollHeight;
}

btnClearTerminal.addEventListener('click', () => {
  terminalFeed.innerHTML = '<div class="text-slate-500">[System] Terminal cleared.</div>';
});

// Mining simulation logic
btnToggleMining.addEventListener('click', () => {
  isMining = !isMining;
  const email = minerEmailInput.value || 'miner.node@bitminer.io';
  const miner_identity_email = btoa(email);

  if (isMining) {
    btnToggleMining.textContent = 'Stop Mining';
    btnToggleMining.className = 'w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20 hover:opacity-95 transition-all duration-200';
    rigStatusText.textContent = 'Mining Active';
    rigStatusText.className = 'text-cyan-400 font-semibold';
    statHashrate.textContent = '48.20 MH/s';
    logToTerminal(`[Mining] Rig started for identity email: <span class="text-slate-200">${email}</span> (b64: ${miner_identity_email})`);

    miningInterval = setInterval(() => {
      blabCount++;
      statBlabs.textContent = blabCount;
      
      // Generate core variables: [blab], [miner_identity_email], [app_user_selected_amount]
      const randomSalt = Math.random().toString(36.substring(2));
      const blab = btoa(`${email}:${Date.now()}:${randomSalt}`);
      latestBlab = blab;
      convertBlabInput.value = blab;

      const app_user_selected_amount = parseFloat(convertAmountInput.value) || 100.0;
      const processedOutput = `Mined [blab]: ${blab.substring(0, 16)}... | [miner_identity_email]: ${miner_identity_email.substring(0, 10)}... | [app_user_selected_amount]: ${app_user_selected_amount}`;
      
      logToTerminal(`<span class="text-emerald-400">[Block #${blabCount}]</span> Successfully mined & verified. ${processedOutput}`);
    }, 3500);
  } else {
    clearInterval(miningInterval);
    btnToggleMining.textContent = 'Start Mining';
    btnToggleMining.className = 'w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all duration-200';
    rigStatusText.textContent = 'Idle';
    rigStatusText.className = 'text-emerald-400';
    statHashrate.textContent = '0.00 MH/s';
    logToTerminal('[Mining] Rig paused.');
  }
});

// Conversion Logic
function updateConversionPreview() {
  const emailVal = convertEmailInput.value;
  const miner_identity_email = btoa(emailVal);
  const app_user_selected_amount = parseFloat(convertAmountInput.value) || 0;
  const blab = latestBlab || btoa('default-blab-token');

  conversionOutput.innerHTML = `Converted Data -> [blab]: ${blab.substring(0, 12)}... | [miner_identity_email]: ${miner_identity_email.substring(0, 10)}... | [app_user_selected_amount]: ${app_user_selected_amount} BTC-equivalent`;
}

convertAmountInput.addEventListener('input', updateConversionPreview);
convertEmailInput.addEventListener('input', updateConversionPreview);

btnExecuteConversion.addEventListener('click', () => {
  const emailVal = convertEmailInput.value;
  const miner_identity_email = btoa(emailVal);
  const app_user_selected_amount = parseFloat(convertAmountInput.value) || 0;
  const blab = latestBlab || btoa('default-blab-token');

  logToTerminal(`<span class="text-yellow-400">[Conversion]</span> Processed [blab]=${blab.substring(0, 8)}..., [miner_identity_email]=${miner_identity_email.substring(0, 8)}..., [app_user_selected_amount]=${app_user_selected_amount}`);
  alert(`Conversion successful! Processed amount: ${app_user_selected_amount} for ${emailVal}`);
});
