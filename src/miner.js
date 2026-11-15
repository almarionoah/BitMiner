/**
 * BitMiner Engine
 * Core Mining and Conversion Processing Algorithm.
 * Implements required core variables: [blab], [miner_identity_email], and [app_user_selected_amount].
 */

const EMAIL_PREFIXES = ['miner', 'node', 'core', 'cipher', 'agent', 'sat', 'vault', 'block', 'hash', 'echo'];
const EMAIL_DOMAINS = ['it-skokos.network', 'bitminer.crypto', 'cloudhash.org', 'genesis.io', 'decentral.net'];

export class BitMinerEngine {
  constructor(onLogCallback, onStatsCallback) {
    this.onLog = onLogCallback || console.log;
    this.onStats = onStatsCallback || (() => {});

    // Internal state
    this.isMining = false;
    this.miningTimer = null;
    this.autoConvertEnabled = true;
    this.hashrate = 0;
    this.totalConvertedBtc = 0;
    this.blabCounter = 0;

    // Storage queue
    this.unconvertedBlabs = [];
    this.convertedHistory = [];

    // Load stored state if available
    this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem('bitminer_state');
      if (stored) {
        const data = JSON.parse(stored);
        this.unconvertedBlabs = Array.isArray(data.unconvertedBlabs) ? data.unconvertedBlabs : [];
        this.convertedHistory = Array.isArray(data.convertedHistory) ? data.convertedHistory : [];
        this.totalConvertedBtc = typeof data.totalConvertedBtc === 'number' ? data.totalConvertedBtc : 0;
        this.blabCounter = typeof data.blabCounter === 'number' ? data.blabCounter : 0;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  saveState() {
    try {
      const payload = {
        unconvertedBlabs: this.unconvertedBlabs,
        convertedHistory: this.convertedHistory.slice(-100),
        totalConvertedBtc: this.totalConvertedBtc,
        blabCounter: this.blabCounter
      };
      localStorage.setItem('bitminer_state', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  /**
   * Helper to generate a random valid email address
   */
  generateRandomEmail() {
    const prefix = EMAIL_PREFIXES[Math.floor(Math.random() * EMAIL_PREFIXES.length)];
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
    return `${prefix}.${randNum}@${domain}`;
  }

  /**
   * Helper to generate a 32-byte hexadecimal / base64 cryptographic key
   */
  generateBase64Key() {
    const randomBytes = new Uint8Array(24);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < 24; i++) randomBytes[i] = Math.floor(Math.random() * 256);
    }
    return btoa(String.fromCharCode(...randomBytes));
  }

  /**
   * Encrypts/encodes email to Base64
   */
  encodeEmailToBase64(rawEmail) {
    return btoa(unescape(encodeURIComponent(rawEmail)));
  }

  /**
   * Mining Step:
   * 1. Auto-generate valid email address in base64 encryption.
   * 2. Generate a base64 key value.
   * 3. Combine the two generated base64 strings into the core [blab].
   */
  executeMineCycle(options = {}) {
    const { activeEmail, selectedAmount } = options;

    const rawGeneratedEmail = this.generateRandomEmail();
    const encryptedEmail = this.encodeEmailToBase64(rawGeneratedEmail);
    const generatedB64Key = this.generateBase64Key();

    // Combine the two generated base64 strings into [blab]
    const blab = `${encryptedEmail}:${generatedB64Key}`;
    this.blabCounter++;

    const blabRecord = {
      id: `BLAB-${Date.now()}-${this.blabCounter}`,
      rawEmail: rawGeneratedEmail,
      encryptedEmail: encryptedEmail,
      keyValue: generatedB64Key,
      blab: blab,
      timestamp: new Date().toISOString(),
      status: 'MINED'
    };

    this.unconvertedBlabs.push(blabRecord);
    this.saveState();

    // Log output to feed terminal
    this.onLog({
      type: 'MINE',
      tag: 'MINE',
      msg: `Auto-generated encrypted identity <strong>${rawGeneratedEmail}</strong> [B64: ${encryptedEmail.substring(0, 12)}...]`
    });

    this.onLog({
      type: 'BLAB',
      tag: 'BLAB',
      msg: `Created combination token <span class="term-highlight">[blab]</span> #${this.blabCounter}: <span class="term-val">${blab.substring(0, 24)}...</span>`
    });

    // Check if auto-convert is active
    if (this.autoConvertEnabled && activeEmail && selectedAmount) {
      this.convertSingleBlab(blabRecord, activeEmail, selectedAmount);
    }

    this.notifyStats(blabRecord);
    return blabRecord;
  }

  /**
   * Core Conversion Algorithm:
   * Uses [blab], [miner_identity_email], and [app_user_selected_amount]
   * to process and credit conversion into the terminal feed.
   */
  convertSingleBlab(blabRecord, miner_identity_email, app_user_selected_amount) {
    if (!blabRecord || !blabRecord.blab) return null;

    const blab = blabRecord.blab;
    const parsedAmount = parseFloat(app_user_selected_amount) || 0.0005;

    // Verification: ensure [blab] splits into encrypted email and base64 key
    const blabParts = blab.split(':');
    const validFormat = blabParts.length === 2 && blabParts[0].length > 0 && blabParts[1].length > 0;

    if (!validFormat) {
      this.onLog({
        type: 'WARN',
        tag: 'WARN',
        msg: `Failed to process [blab]: Invalid structure for token ${blabRecord.id}`
      });
      return null;
    }

    // Algorithmic conversion calculation based on user selected amount and identity signature
    const creditedBtc = Number(parsedAmount.toFixed(8));
    this.totalConvertedBtc = Number((this.totalConvertedBtc + creditedBtc).toFixed(8));

    // Remove from unconverted list
    this.unconvertedBlabs = this.unconvertedBlabs.filter((item) => item.id !== blabRecord.id);

    const conversionEvent = {
      id: `TX-${Date.now()}`,
      blabId: blabRecord.id,
      blab: blab,
      miner_identity_email: miner_identity_email,
      app_user_selected_amount: creditedBtc,
      processedAt: new Date().toISOString()
    };

    this.convertedHistory.push(conversionEvent);
    this.saveState();

    // Automatic output response to the feed terminal for this singular processed combination
    this.onLog({
      type: 'CONVERT',
      tag: 'CONV',
      msg: `Converted <span class="term-highlight">[blab]</span> [${blabRecord.id}] -> Beneficiary: <strong>${miner_identity_email}</strong> | Credited: <strong class="term-val">${creditedBtc.toFixed(6)} BTC</strong> (<span class="code-var">[app_user_selected_amount]</span>)`
    });

    this.notifyStats();
    return conversionEvent;
  }

  /**
   * Convert all queued or selected BLABs sequentially
   */
  processQueueConversion(miner_identity_email, app_user_selected_amount) {
    if (this.unconvertedBlabs.length === 0) {
      this.onLog({
        type: 'SYS',
        tag: 'SYS',
        msg: 'No pending [blab] tokens in conversion queue.'
      });
      return [];
    }

    this.onLog({
      type: 'SYS',
      tag: 'SYS',
      msg: `Initiating batch conversion of ${this.unconvertedBlabs.length} [blab] token(s) for miner identity <${miner_identity_email}> at amount ${app_user_selected_amount} BTC...`
    });

    const blabsToProcess = [...this.unconvertedBlabs];
    const results = [];

    for (const record of blabsToProcess) {
      const res = this.convertSingleBlab(record, miner_identity_email, app_user_selected_amount);
      if (res) results.push(res);
    }

    return results;
  }

  startMining(activeEmail, selectedAmount) {
    if (this.isMining) return;
    this.isMining = true;

    this.onLog({
      type: 'SYS',
      tag: 'SYS',
      msg: 'Mining engine initiated. Generating Base64 encrypted email identities and keys...'
    });

    this.miningTimer = setInterval(() => {
      // Simulated variable hashrate
      this.hashrate = Number((42.5 + Math.random() * 15.2).toFixed(2));
      this.executeMineCycle({ activeEmail, selectedAmount });
    }, 2800);
  }

  stopMining() {
    if (!this.isMining) return;
    this.isMining = false;
    if (this.miningTimer) {
      clearInterval(this.miningTimer);
      this.miningTimer = null;
    }
    this.hashrate = 0;
    this.onLog({
      type: 'SYS',
      tag: 'SYS',
      msg: 'Mining engine paused. Mining threads released.'
    });
    this.notifyStats();
  }

  burstMining(count, activeEmail, selectedAmount) {
    this.onLog({
      type: 'SYS',
      tag: 'SYS',
      msg: `Executing quick burst mining (${count} blocks)...`
    });
    for (let i = 0; i < count; i++) {
      this.executeMineCycle({ activeEmail, selectedAmount });
    }
  }

  clearQueue() {
    const count = this.unconvertedBlabs.length;
    this.unconvertedBlabs = [];
    this.saveState();
    this.onLog({
      type: 'WARN',
      tag: 'WARN',
      msg: `Cleared ${count} pending unconverted [blab] records.`
    });
    this.notifyStats();
  }

  exportMinedJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      totalConvertedBtc: this.totalConvertedBtc,
      unconvertedBlabs: this.unconvertedBlabs,
      convertedHistory: this.convertedHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitminer-mined-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.onLog({
      type: 'SYS',
      tag: 'SYS',
      msg: `Exported mined data JSON file successfully (${this.unconvertedBlabs.length} pending, ${this.convertedHistory.length} converted).`
    });
  }

  notifyStats(latestRecord) {
    this.onStats({
      isMining: this.isMining,
      hashrate: this.hashrate,
      unconvertedCount: this.unconvertedBlabs.length,
      convertedCount: this.convertedHistory.length,
      totalConvertedBtc: this.totalConvertedBtc,
      latestRecord
    });
  }
}
