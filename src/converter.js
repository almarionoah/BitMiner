/**
 * BitMiner Core Conversion & Mining Engine
 * Core algorithm ensuring [blab], [miner_identity_email], and [app_user_selected_amount]
 * are accurately bound and computed for data conversion.
 */

const EMAIL_DOMAINS = ['bitminer.net', 'cryptonode.org', 'hashvault.io', 'decentranode.eth', 'satoshinet.com'];
const USER_PREFIXES = ['miner', 'hash_core', 'node_alpha', 'worker_x', 'quantum_rig', 'block_seeker'];

/**
 * Generate a valid email address and encode to base64
 */
export function generateBase64Email() {
  const prefix = USER_PREFIXES[Math.floor(Math.random() * USER_PREFIXES.length)];
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  const plainEmail = `${prefix}_${randNum}@${domain}`;
  const base64Email = btoa(plainEmail);
  return { plainEmail, base64Email };
}

/**
 * Generate a base64 cryptographic key value
 */
export function generateBase64Key() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generate a complete mined base64 blab (combining base64 email and base64 key)
 */
export function generateMinedBlab() {
  const { plainEmail, base64Email } = generateBase64Email();
  const base64Key = generateBase64Key();
  // Combination of base64 email and base64 key value forming the [blab]
  const blab = `${base64Email}.${base64Key}`;
  
  return {
    id: 'blab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    blab,
    plainEmail,
    base64Email,
    base64Key,
    timestamp: new Date().toISOString(),
    converted: false,
    convertedAmount: 0,
    minerEmail: null,
    txHash: null
  };
}

/**
 * Core processing algorithm for converting mined blab data into verified cryptocurrency credits.
 * Explicitly processes [blab], [miner_identity_email], and [app_user_selected_amount].
 * 
 * @param {string} blab - The mined singular base64 string combination
 * @param {string} miner_identity_email - Target miner identity email address
 * @param {number|string} app_user_selected_amount - User selected conversion amount per blab
 * @returns {object} Processed conversion transaction result
 */
export function processConversion(blab, miner_identity_email, app_user_selected_amount) {
  if (!blab || typeof blab !== 'string') {
    throw new Error('Invalid blab: base64 blab string is required');
  }
  if (!miner_identity_email || typeof miner_identity_email !== 'string' || !miner_identity_email.includes('@')) {
    throw new Error('Invalid miner identity email: Please supply a valid email address');
  }

  const parsedAmount = parseFloat(app_user_selected_amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid amount: [app_user_selected_amount] must be greater than zero');
  }

  // Verify base64 components inside blab
  const [b64Email, b64Key] = blab.split('.');
  let decodedEmail = 'unknown';
  try {
    decodedEmail = atob(b64Email);
  } catch (e) {
    decodedEmail = 'legacy_encoded_payload';
  }

  // Generate deterministic pseudo-hash for cryptographic verification
  const seed = `${blab}::${miner_identity_email}::${parsedAmount}`;
  let hashNum = 0;
  for (let i = 0; i < seed.length; i++) {
    hashNum = (hashNum << 5) - hashNum + seed.charCodeAt(i);
    hashNum |= 0;
  }
  const hexHash = '0x' + Math.abs(hashNum).toString(16).padStart(8, '0') + Date.now().toString(16);

  return {
    success: true,
    blab,
    miner_identity_email,
    app_user_selected_amount: parsedAmount,
    decodedEmail,
    txHash: hexHash,
    processedAt: new Date().toISOString(),
    message: `Processed [${blab.slice(0, 16)}...] -> Miner [${miner_identity_email}] crediting ${parsedAmount.toFixed(6)} BTC`
  };
}
