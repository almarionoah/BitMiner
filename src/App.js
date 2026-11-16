import React, { useState, useEffect, useRef } from 'react';
import { Cpu, RefreshCw, Terminal, Download, Zap, Shield, HardDrive, DollarSign, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('mine');
  const [isMining, setIsMining] = useState(false);
  const [minerIdentityEmail, setMinerIdentityEmail] = useState('');
  const [blab, setBlab] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, text: 'System initialized. Ready for mining and conversion operations.', type: 'info', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [appUserSelectedAmount, setAppUserSelectedAmount] = useState(10);
  const [conversionLogs, setConversionLogs] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('PWA installation is already available or installed via your browser menu.');
    }
  };

  // Auto scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs, conversionLogs]);

  // Mining loop
  useEffect(() => {
    let interval;
    if (isMining) {
      interval = setInterval(() => {
        const rawEmail = `miner_${Math.floor(Math.random() * 90000 + 10000)}@bitminer.io`;
        const encodedEmail = btoa(rawEmail);
        const randomKeyBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
        const encodedKey = btoa(String.fromCharCode(...randomKeyBytes));
        
        setMinerIdentityEmail(encodedEmail);
        setBlab(encodedKey);

        const newLog = {
          id: Date.now(),
          text: `[MINED] Email: ${encodedEmail} | Blab Key: ${encodedKey}`,
          type: 'success',
          timestamp: new Date().toLocaleTimeString()
        };
        setTerminalLogs(prev => [...prev.slice(-49), newLog]);

        // Auto-convert process as data populates
        processConversion(encodedKey, encodedEmail, appUserSelectedAmount);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isMining, appUserSelectedAmount]);

  const processConversion = (currentBlab, currentEmail, currentAmount) => {
    if (!currentBlab || !currentEmail) return;
    
    // Processing algorithm implementing the core variables
    const conversionScore = (currentBlab.length * currentAmount) / 2.5;
    const payoutToken = Math.abs(Math.sin(Date.now()) * currentAmount * 1.45).toFixed(4);
    
    const conversionResult = {
      id: Date.now() + Math.random(),
      blab: currentBlab,
      miner_identity_email: currentEmail,
      app_user_selected_amount: currentAmount,
      outputResponse: `Converted ${payoutToken} BTC equivalent for email ${atob(currentEmail)} using amount ${currentAmount} (Score: ${conversionScore.toFixed(2)})`,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversionLogs(prev => [conversionResult, ...prev.slice(0, 49)]);
  };

  const handleManualConvert = () => {
    if (!blab || !minerIdentityEmail) {
      alert('Please start mining first to generate valid base64 blab and email identity.');
      return;
    }
    setIsConverting(true);
    setTimeout(() => {
      processConversion(blab, minerIdentityEmail, appUserSelectedAmount);
      setTerminalLogs(prev => [...prev, {
        id: Date.now(),
        text: `[CONVERTED] Manual conversion executed for amount: ${appUserSelectedAmount}`,
        type: 'accent',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsConverting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-black shadow-lg">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                BITMINER
              </h1>
              <p className="text-xs text-slate-400">Decrypted Base64 Mining Terminal</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'mine'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mine
            </button>
            <button
              onClick={() => setActiveTab('convert')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'convert'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Convert
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls & Active State */}
        <div className="lg:col-span-1 space-y-6">
          <div className="app-card rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Miner Rig Control</span>
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isMining ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {isMining ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Miner Identity Email (Base64)</label>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-300 break-all">
                  {minerIdentityEmail || 'No active identity generated'}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Generated Blab Key (Base64)</label>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-blue-300 break-all">
                  {blab || 'No active blab key generated'}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">App User Selected Amount ([app_user_selected_amount])</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={appUserSelectedAmount}
                  onChange={(e) => setAppUserSelectedAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsMining(!isMining)}
                className={`w-full py-3 rounded-xl font-medium text-sm shadow-lg flex items-center justify-center space-x-2 transition ${
                  isMining
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'btn-primary text-white'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isMining ? 'animate-spin' : ''}`}
                />
                <span>{isMining ? 'Stop Mining' : 'Start Mining & Auto-Convert'}</span>
              </button>
            </div>
          </div>

          {/* System Metrics */}
          <div className="app-card rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-sm mb-4 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Network Data Contract</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Algorithm Protocol</span>
                <span className="font-mono text-slate-200">SHA-256 Base64 v2</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Retry Queue</span>
                <span className="font-emerald text-emerald-400">Operational (0 failed)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Hot Query Cache</span>
                <span className="text-blue-400">Active (Hit Ratio 99.4%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs (Mine Feed / Convert Terminal) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'mine' ? (
            <div className="app-card rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Live Mining Feed Terminal</span>
                </h2>
                <span className="text-xs text-slate-400">Auto-updating stream</span>
              </div>

              <div className="flex-1 bg-slate-950/90 rounded-xl p-4 overflow-y-auto terminal-output border border-slate-800/80 space-y-2">
                {terminalLogs.map(log => (
                  <div key={log.id} className="text-xs flex items-start space-x-2">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span className={`break-all ${
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'accent'
                        ? 'text-blue-400'
                        : 'text-slate-300'
                    }`}>
                      {log.text}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          ) : (
            <div className="app-card rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span>Conversion Processing Terminal</span>
                </h2>
                <button
                  onClick={handleManualConvert}
                  disabled={isConverting}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition disabled:opacity-50"
                >
                  {isConverting ? 'Processing...' : 'Execute Conversion'}
                </button>
              </div>

              <div className="flex-1 bg-slate-950/90 rounded-xl p-4 overflow-y-auto terminal-output border border-slate-800/80 space-y-3">
                {conversionLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
                    <p>No conversion records yet. Start mining or trigger manual conversion.</p>
                  </div>
                ) : (
                  conversionLogs.map(item => (
                    <div key={item.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Email: {item.miner_identity_email}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <div className="font-mono text-emerald-400 break-all">
                        blab: {item.blab}
                      </div>
                      <div className="text-blue-300">
                        {item.outputResponse}
                      </div>
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} BitMiner Platforms. All rights reserved. Secure Base64 Data Processing Pipeline.
      </footer>
    </div>
  );
}
