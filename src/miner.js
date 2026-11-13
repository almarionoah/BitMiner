/**
 * BitMiner Engine Module
 * Handles email generation, base64 encryption, blab synthesis, 
 * and the exact conversion processing algorithm with core variables:
 * [blab], [miner_identity_email], [app_user_selected_amount]
 */

const STORAGE_KEY_MINED = 'bitminer_mined_blabs';
const STORAGE_KEY_CONVERTED = 'bitminer_converted_blabs';

// Predefined pool for synthesizing realistic valid email domains
const EMAIL_USERNAMES = [
  'satoshi.node', 'nexus.hash', 'block.runner', 'cyber.core',
  'alpha.miner', 'delta.vector', 'quantum.gate', 'bit.sentinel',
  'phantom.rig', 'crypto.forge', 'stratum.peer', 'cipher.pulse'
];

const EMAIL_DOMAINS = [
  'bitminer.org', 'crypto-node.net', 'stratum-pool.io',
  'blockledger.tech', 'hashmesh.org', 'securenets.io'
];

/**
 * Auto-generates a valid email address and encrypts it to Base64.
 */
export function generateEncryptedEmail() {
  const username = EMAIL_USERNAMES[Math.floor(Math.random() * EMAIL_USERNAMES.length)];
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  const randomSalt = Math.floor(1000 + Math.random() * 9000);
  const rawEmail = `${username}${randomSalt}@${domain}`;
  const base64Email = btoa(rawEmail);
  return { rawEmail, base64Email };
}

/**
 * Generates a high-entropy Base64 key value.
 */
export function generateBase64Key() {
  const bytes = new Uint8Array(18);
  window.crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Combines Base64 encrypted email and Base64 key value into a final cryptographic [blab].
 */
export function generateMinedBlab() {
  const { rawEmail, base64Email } = generateEncryptedEmail();
  const base64Key = generateBase64Key();
  
  // Core synthesis: combine the two base64 strings into the singular mined [blab]
  const rawBlabPayload = `${base64Email}::${base64Key}::${Date.now()}`;
  const blab = btoa(rawBlabPayload);

  const record = {
    id: 'blab_' + Math.random().toString(36).substring(2, 9),
    blab,
    base64Email,
    rawEmail,
    base64Key,
    minedAt: new Date().toISOString(),
    status: 'PENDING'
  };

  saveMinedRecord(record);
  return record;
}

/**
 * Local storage helpers for mined records
 */
export function getMinedRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MINED);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading mined storage', err);
    return [];
  }
}

export function saveMinedRecord(record) {
  const existing = getMinedRecords();
  existing.unshift(record);
  // Keep up to 200 items in local buffer
  if (existing.length > 200) existing.pop();
  localStorage.setItem(STORAGE_KEY_MINED, JSON.stringify(existing));
}

export function getConvertedRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONVERTED);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading converted storage', err);
    return [];
  }
}

export function saveConvertedRecord(record) {
  const existing = getConvertedRecords();
  existing.unshift(record);
  localStorage.setItem(STORAGE_KEY_CONVERTED, JSON.stringify(existing));
}

export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY_MINED);
  localStorage.removeItem(STORAGE_KEY_CONVERTED);
}

/**
 * Core Conversion Processing Algorithm
 * Explicitly required to use variables:
 * [blab], [miner_identity_email], and [app_user_selected_amount]
 */
export function processBlabConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || typeof blab !== 'string') {
    throw new Error('Invalid core variable [blab]: string value required');
  }
  if (!miner_identity_email || typeof miner_identity_email !== 'string') {
    throw new Error('Invalid core variable [miner_identity_email]: destination email required');
  }
  
  const amount = parseFloat(app_user_selected_amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid core variable [app_user_selected_amount]: positive number required');
  }

  // Decode blab envelope
  let decodedRaw = '';
  try {
    decodedRaw = atob(blab);
  } catch (e) {
    decodedRaw = 'UNKNOWN_BLAB_PAYLOAD';
  }

  // Verification hash based on [blab], [miner_identity_email], and [app_user_selected_amount]
  const verificationSignature = `${blab.substring(0, 16)}_${miner_identity_email}_${amount.toFixed(2)}`;
  const hash = '0x' + btoa(verificationSignature).replace(/=/g, '').substring(0, 24);

  // Convert to equivalent crypto shares
  const cryptoShares = (amount * 0.00001542).toFixed(8);

  const conversionResult = {
    conversionId: 'tx_' + Math.random().toString(36).substring(2, 10),
    blab,
    miner_identity_email,
    app_user_selected_amount: amount,
    usdValue: amount,
    cryptoShares: `${cryptoShares} BTC`,
    verificationHash: hash,
    decodedComponents: decodedRaw,
    processedAt: new Date().toISOString(),
    status: 'VERIFIED_SUCCESS'
  };

  // Update status in mined records
  const mined = getMinedRecords();
  const target = mined.find((m) => m.blab === blab);
  if (target) {
    target.status = 'CONVERTED';
    localStorage.setItem(STORAGE_KEY_MINED, JSON.stringify(mined));
  }

  saveConvertedRecord(conversionResult);
  return conversionResult;
}

/**
 * Converts next pending blab or all pending blabs
 */
export function convertPendingBlabs(miner_identity_email, app_user_selected_amount, limit = null) {
  const mined = getMinedRecords();
  const pending = mined.filter((m) => m.status === 'PENDING');
  
  const toProcess = limit ? pending.slice(0, limit) : pending;
  const results = [];

  for (const item of toProcess) {
    const blab = item.blab;
    const result = processBlabConversion(blab, miner_identity_email, app_user_selected_amount);
    results.push(result);
  }

  return results;
}
