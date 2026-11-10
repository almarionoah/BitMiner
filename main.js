import './style.css';
import { createIcons, Cpu, RefreshCw, Terminal, Shield, Zap, Download, Wallet, Database, CheckCircle2 } from 'lucide-react';

// Initialize application state
const state = {
  activeTab: 'mine',
  isMining: false,
  miner_identity_email: '',
  blab: '',
  app_user_selected_amount: 1.0,
  minedDataCount: 0,
  feedLogs: [],
  miningInterval: null,
  pwaDeferredPrompt: null
};

function generateBase64Email() {
  const randomId = Math.random().toString(36.substring(2, 10));
  const rawEmail = `miner_${randomId}@it-skokos.io`;
  return btoa(rawEmail);
}

function generateBase64Key() {
  const rawKey = `blab_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  return btoa(rawKey);
}

function logToTerminal(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  state.feedLogs.unshift({ timestamp, message, type });
  if (state.feedLogs.length > 50) state.feedLogs.pop();
  renderTerminal();
}

function render() {
  const app = document.querySelector('#app');
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col">
      <!-- Top Navigation Header -->
      <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span class="font-black text-xl tracking-wider text-white">BM</span>
            </div>
            <div>
              <h1 class="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">BitMiner Pro</h1>
              <p class="text-xs text-slate-400">Decentralized Compute & Conversion Engine</p>
            </div>
          </div>
          
          <nav class="flex items-center space-x-1 sm:space-x-2">
            <button id="nav-mine" class="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${state.activeTab === 'mine' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span>Mine</span>
            </button>
            <button id="nav-convert" class="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${state.activeTab === 'convert' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              <span>Convert</span>
            </button>
            <button id="install-btn" class="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Install App</span>
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Workspace -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left/Center Panel (Tab Content) -->
        <div class="lg:col-span-2 space-y-6">
          ${state.activeTab === 'mine' ? renderMineTab() : renderConvertTab()}
        </div>

        <!-- Right Panel (Feed Terminal & Status) -->
        <div class="space-y-6">
          <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <h2 class="font-semibold text-slate-200">Feed Terminal</h2>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Stream
              </span>
            </div>
            <div id="terminal-feed" class="bg-slate-950 border border-slate-800/80 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs space-y-2 shadow-inner">
              ${state.feedLogs.length === 0 ? '<div class="text-slate-600 text-center py-24">System initialized. Start mining or converting to stream logs...</div>' : ''}
            </div>
          </div>

          <!-- System Status -->
          <div class="bg-gradient-to-r from-slate-900/90 to-indigo-950/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
            <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Node Metrics</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-950/60 border border-slate-800/50 p-4 rounded-xl">
                <p class="text-xs text-slate-400">Blocks Mined</p>
                <p class="text-2xl font-black text-cyan-400 mt-1">${state.minedDataCount}</p>
              </div>
              <div class="bg-slate-950/60 border border-slate-800/50 p-4 rounded-xl">
                <p class="text-xs text-slate-400">Network Status</p>
                <p class="text-sm font-bold text-emerald-400 mt-1 flex items-center space-x-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Operational</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        &copy; ${new Date().getFullYear()} BitMiner Inc. All rights reserved. Secure Base64 Pipeline.
      </footer>
    </div>
  `;

  attachEventListeners();
}

function renderMineTab() {
  return `
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Cryptocurrency Mining Engine</h2>
          <p class="text-slate-400 text-sm mt-1">Generate encrypted miner identity credentials and process base64 'blab' keys.</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
          <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Miner Identity Email (Base64)</label>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 break-all min-h-[48px] flex items-center">
            ${state.miner_identity_email || '<span class="text-slate-600">Click Start Mining to generate...</span>'}
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Current Mined Key [blab] (Base64)</label>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 break-all min-h-[48px] flex items-center">
            ${state.blab || '<span class="text-slate-600">Awaiting generated blab...</span>'}
          </div>
        </div>
      </div>

      <div class="pt-4 flex flex-col sm:flex-row items-center gap-4">
        <button id="toggle-mining-btn" class="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${state.isMining ? 'from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20' : 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20'} text-white shadow-lg transition-all flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>${state.isMining ? 'Stop Mining' : 'Start Mining'}</span>
        </button>
        <p class="text-xs text-slate-400 text-center sm:text-left">${state.isMining ? 'Mining active: generating continuous base64 blabs...' : 'Click start to generate auto-encrypted miner identity and blabs.'}</p>
      </div>
    </div>
  `;
}

function renderConvertTab() {
  return `
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Data Conversion Hub</h2>
          <p class="text-slate-400 text-sm mt-1">Process conversion algorithms using <code class="text-cyan-300">[blab]</code>, <code class="text-cyan-300">[miner_identity_email]</code>, and <code class="text-cyan-300">[app_user_selected_amount]</code>.</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-600/20 border border-indigo-500/30 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Miner Identity Email</label>
          <input type="email" id="convert-email" value="${atob(state.miner_identity_email || btoa('default@it-skokos.io'))}" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition" placeholder="Enter miner email..." />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Conversion Amount ([app_user_selected_amount])</label>
          <input type="number" id="convert-amount" value="${state.app_user_selected_amount}" step="0.1" min="0.1" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Input Base64 Blab String ([blab])</label>
        <textarea id="convert-blab" rows="3" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 focus:outline-none focus:border-cyan-500 transition" placeholder="Paste or generate base64 blab...">${state.blab || generateBase64Key()}</textarea>
      </div>

      <div class="pt-4 flex items-center justify-between">
        <button id="run-conversion-btn" class="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span>Process Conversion</span>
        </button>
        <button id="auto-convert-toggle" class="px-4 py-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
          Toggle Auto-Convert Stream
        </button>
      </div>
    </div>
  `;
}

function renderTerminal() {
  const term = document.querySelector('#terminal-feed');
  if (!term) return;
  term.innerHTML = state.feedLogs.map(log => {
    let color = 'text-slate-300';
    if (log.type === 'success') color = 'text-emerald-400';
    if (log.type === 'error') color = 'text-rose-400';
    if (log.type === 'action') color = 'text-cyan-400';
    return `
      <div class="flex items-start space-x-2 border-b border-slate-900 pb-1.5">
        <span class="text-slate-600 select-none">[${log.timestamp}]</span>
        <span class="${color} break-all flex-1">${log.message}</span>
      </div>
    `;
  }).join('');
}

function attachEventListeners() {
  const navMine = document.querySelector('#nav-mine');
  const navConvert = document.querySelector('#nav-convert');
  const toggleMiningBtn = document.querySelector('#toggle-mining-btn');
  const runConversionBtn = document.querySelector('#run-conversion-btn');
  const installBtn = document.querySelector('#install-btn');

  if (navMine) {
    navMine.addEventListener('click', () => {
      state.activeTab = 'mine';
      render();
    });
  }

  if (navConvert) {
    navConvert.addEventListener('click', () => {
      state.activeTab = 'convert';
      render();
    });
  }

  if (toggleMiningBtn) {
    toggleMiningBtn.addEventListener('click', () => {
      state.isMining = !state.isMining;
      if (state.isMining) {
        if (!state.miner_identity_email) {
          state.miner_identity_email = generateBase64Email();
          logToTerminal(`Generated miner_identity_email: ${state.miner_identity_email}`, 'success');
        }
        logToTerminal('Mining sequence initiated...', 'action');
        state.miningInterval = setInterval(() => {
          state.blab = generateBase64Key();
          state.minedDataCount++;
          logToTerminal(`Mined new block [blab]: ${state.blab}`, 'action');
          
          // Auto-convert processing
          const emailDecoded = atob(state.miner_identity_email);
          logToTerminal(`Auto-processed conversion for ${emailDecoded} with amount ${state.app_user_selected_amount} and blab ${state.blab}`, 'success');
          render();
        }, 4000);
      } else {
        clearInterval(state.miningInterval);
        logToTerminal('Mining sequence paused.', 'info');
      }
      render();
    });
  }

  if (runConversionBtn) {
    runConversionBtn.addEventListener('click', () => {
      const emailInput = document.querySelector('#convert-email');
      const amountInput = document.querySelector('#convert-amount');
      const blabInput = document.querySelector('#convert-blab');

      const email = emailInput ? emailInput.value : 'default@it-skokos.io';
      state.miner_identity_email = btoa(email);
      state.app_user_selected_amount = parseFloat(amountInput ? amountInput.value : 1.0);
      state.blab = blabInput ? blabInput.value : generateBase64Key();

      logToTerminal(`Manual conversion triggered -> miner_identity_email: ${state.miner_identity_email}, app_user_selected_amount: ${state.app_user_selected_amount}, blab: ${state.blab}`, 'success');
    });
  }

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (state.pwaDeferredPrompt) {
        state.pwaDeferredPrompt.prompt();
        state.pwaDeferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            logToTerminal('PWA installation accepted by user.', 'success');
          }
          state.pwaDeferredPrompt = null;
        });
      } else {
        logToTerminal('PWA ready. Use browser menu to Add to Home Screen.', 'info');
        alert('BitMiner is ready for installation! Use your browser menu ("Add to Home Screen" or "Install app") to install.');
      }
    });
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.pwaDeferredPrompt = e;
  logToTerminal('PWA install prompt captured.', 'success');
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  render();
  logToTerminal('BitMiner core system online. Ready for mining & conversion.', 'success');
});
