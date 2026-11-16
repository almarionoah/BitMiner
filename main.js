import './style.css';

// Core BitMiner Application State and Logic
const state = {
  currentTab: 'mine',
  miningActive: false,
  minerIdentityEmail: '',
  blab: '',
  minedBlocks: [],
  appUserSelectedAmount: 1,
  conversionLogs: [],
  miningInterval: null,
  hashRate: 0,
  totalMined: 0
};

function generateBase64Email() {
  const userNames = ['miner', 'crypto', 'node', 'hash', 'block', 'satoshi', 'validator', 'ledger'];
  const domains = ['bitminer.io', 'cryptomail.net', 'chainbase.org', 'ethernode.co'];
  const randomUser = userNames[Math.floor(Math.random() * userNames.length)] + Math.floor(Math.random() * 1000);
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const rawEmail = `${randomUser}@${randomDomain}`;
  return btoa(rawEmail);
}

function generateBase64Blab() {
  const randomBytes = window.crypto && window.crypto.getRandomValues ? 
    window.crypto.getRandomValues(new Uint8Array(24)) :
    new Uint8Array(24).map(() => Math.floor(Math.random() * 256));
  let binary = '';
  for (let i = 0; i < randomBytes.byteLength; i++) {
    binary += String.fromCharCode(randomBytes[i]);
  }
  return btoa(binary);
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-bold text-xl">
            ₿
          <div>
            <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">BitMiner</h1>
            <p class="text-xs text-slate-400">Decentralized Cloud Mining & Conversion</p>
          </div>
        </div>
        <nav class="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button id="nav-mine" class="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${state.currentTab === 'mine' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}">
            ⛏️ Mine
          </button>
          <button id="nav-convert" class="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${state.currentTab === 'convert' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}">
            🔄 Convert
          </button>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      ${state.currentTab === 'mine' ? renderMineView() : renderConvertView()}
    </main>

    <footer class="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <p>© ${new Date().getFullYear()} BitMiner Protocol. All rights reserved. PWA Ready.</p>
    </footer>
  `;

  attachEventListeners();
}

function renderMineView() {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1 space-y-6">
        <div class="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-cyan-500/30 p-6 shadow-xl">
          <h2 class="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <span>⚡</span> Miner Identity & Control
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Base58 / Base64 Miner Identity Email [miner_identity_email]</label>
              <input type="text" readonly value="${state.minerIdentityEmail || 'Not initialized'}" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 select-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Latest Generated Blab [blab]</label>
              <input type="text" readonly value="${state.blab || 'Waiting for active block...'}" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500 select-all" />
            </div>
            <button id="btn-toggle-mine" class="w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${state.miningActive ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20' : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-90 shadow-cyan-500/30'}">
              ${state.miningActive ? '⏹️ Stop Mining Rig' : '🚀 Start Mining Rig'}
            </button>
          </div>
        </div>

        <div class="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-6">
          <h3 class="text-sm font-semibold text-slate-300 mb-3">Rig Statistics</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Hash Rate:</span>
              <span class="font-mono text-cyan-400">${state.hashRate} KH/s</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total Mined Blocks:</span>
              <span class="font-mono text-emerald-400">${state.minedBlocks.length}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total Yield:</span>
              <span class="font-mono text-indigo-400">${state.totalMined.toFixed(4)} BLB</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 flex flex-col">
        <div class="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-cyan-500/30 p-6 shadow-xl flex-1 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <span>💻</span> Live Feed Terminal
            </h2>
            <span class="flex items-center gap-2 text-xs px-3 py-1 rounded-full ${state.miningActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
              <span class="w-2 h-2 rounded-full ${state.miningActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}"></span>
              ${state.miningActive ? 'Mining Active' : 'Idle'}
            </span>
          </div>
          <div id="terminal-output" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[480px] min-h-[360px] space-y-2">
            ${state.minedBlocks.length === 0 ? '<div class="text-slate-600 italic">Terminal initialized. Start mining rig to generate [miner_identity_email], [blab], and live feed logs...</div>' : ''}
            ${state.minedBlocks.map(b => `
              <div class="border-b border-slate-900 pb-2">
                <span class="text-cyan-500">[${b.timestamp}]</span> <span class="text-yellow-400">EMAIL:</span> <span class="text-slate-200 select-all">${b.email}</span><br/>
                <span class="text-cyan-500">[${b.timestamp}]</span> <span class="text-emerald-400">BLAB:</span> <span class="text-slate-300 select-all">${b.blab}</span><br/>
                <span class="text-cyan-500">[${b.timestamp}]</span> <span class="text-indigo-400">YIELD:</span> <span class="text-emerald-300">+${b.amount} BLB processed successfully</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderConvertView() {
  return `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-cyan-500/30 p-8 shadow-xl">
        <h2 class="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
          <span>🔄</span> Token & Data Conversion
        </h2>
        <p class="text-sm text-slate-400 mb-6">
          Convert mined [blab] tokens using your [miner_identity_email] and user selected amount [app_user_selected_amount].
        </p>

        <form id="convert-form" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Miner Identity Email [miner_identity_email]</label>
            <input type="text" id="input-convert-email" value="${state.minerIdentityEmail || generateBase64Email()}" required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Base64 Mined Data [blab]</label>
            <input type="text" id="input-convert-blab" value="${state.blab || generateBase64Blab()}" required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-emerald-300 focus:outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Conversion Amount [app_user_selected_amount]</label>
            <input type="number" id="input-convert-amount" min="1" step="1" value="${state.appUserSelectedAmount}" required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500" />
          </div>

          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-cyan-500/30 transition-all duration-200">
            ⚡ Execute Conversion Protocol
          </button>
        </form>
      </div>

      <div class="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <span>📋</span> Conversion History Feed
        </h3>
        <div class="space-y-3 font-mono text-xs">
          ${state.conversionLogs.length === 0 ? '<div class="text-slate-600 italic">No conversion transactions recorded yet.</div>' : ''}
          ${state.conversionLogs.map(log => `
            <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
              <div class="flex justify-between text-cyan-400">
                <span>Timestamp: ${log.timestamp}</span>
                <span class="text-emerald-400">Amount: ${log.amount}</span>
              </div>
              <div class="text-slate-400 truncate">Email: ${log.email}</div>
              <div class="text-slate-300 truncate">Blab: ${log.blab}</div>
              <div class="text-indigo-300 font-bold">Status: Success (Converted)</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function attachEventListeners() {
  const navMine = document.getElementById('nav-mine');
  const navConvert = document.getElementById('nav-convert');

  if (navMine) {
    navMine.addEventListener('click', () => {
      state.currentTab = 'mine';
      render();
    });
  }

  if (navConvert) {
    navConvert.addEventListener('click', () => {
      state.currentTab = 'convert';
      render();
    });
  }

  const btnToggleMine = document.getElementById('btn-toggle-mine');
  if (btnToggleMine) {
    btnToggleMine.addEventListener('click', () => {
      state.miningActive = !state.miningActive;
      if (state.miningActive) {
        if (!state.minerIdentityEmail) {
          state.minerIdentityEmail = generateBase64Email();
        }
        state.hashRate = Math.floor(Math.random() * 400) + 1200;
        state.miningInterval = setInterval(() => {
          state.blab = generateBase64Blab();
          state.appUserSelectedAmount = Math.floor(Math.random() * 5) + 1;
          const newBlock = {
            timestamp: new Date().toLocaleTimeString(),
            email: state.minerIdentityEmail,
            blab: state.blab,
            amount: state.appUserSelectedAmount
          };
          state.minedBlocks.unshift(newBlock);
          state.totalMined += state.appUserSelectedAmount;
          if (state.minedBlocks.length > 50) state.minedBlocks.pop();
          render();
        }, 3000);
      } else {
        clearInterval(state.miningInterval);
        state.hashRate = 0;
      }
      render();
    });
  }

  const convertForm = document.getElementById('convert-form');
  if (convertForm) {
    convertForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('input-convert-email');
      const blabInput = document.getElementById('input-convert-blab');
      const amountInput = document.getElementById('input-convert-amount');

      if (emailInput && blabInput && amountInput) {
        state.minerIdentityEmail = emailInput.value;
        state.blab = blabInput.value;
        state.appUserSelectedAmount = Number(amountInput.value);

        const logEntry = {
          timestamp: new Date().toLocaleTimeString(),
          email: state.minerIdentityEmail,
          blab: state.blab,
          amount: state.appUserSelectedAmount
        };
        state.conversionLogs.unshift(logEntry);
        alert(`Conversion successful for [blab] using [miner_identity_email] with amount [app_user_selected_amount] = ${state.appUserSelectedAmount}!`);
        render();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  state.minerIdentityEmail = generateBase64Email();
  state.blab = generateBase64Blab();
  render();
});
