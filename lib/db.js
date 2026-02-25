import clientPromise from './mongodb';

export async function getDb() {
  const client = await clientPromise;
  return client.db('saweria');
}

// ── Games ─────────────────────────────────────────────────────────────────────

export async function getGames() {
  const db = await getDb();
  return db.collection('games').find({}).toArray();
}

export async function getGameBySecretKey(secretKey) {
  const db = await getDb();
  return db.collection('games').findOne({ secretKey });
}

export async function getGameById(id) {
  const db = await getDb();
  return db.collection('games').findOne({ id });
}

export async function addGame(game) {
  const db = await getDb();
  return db.collection('games').insertOne(game);
}

export async function updateGame(id, updates) {
  const db = await getDb();
  return db.collection('games').updateOne({ id }, { $set: updates });
}

export async function incrementGameStats(id, donationAmount) {
  const db = await getDb();
  return db.collection('games').updateOne(
    { id },
    { $inc: { donations: 1, totalAmount: donationAmount } }
  );
}

export async function deleteGame(id) {
  const db = await getDb();
  return db.collection('games').deleteOne({ id });
}

// ── Donations ─────────────────────────────────────────────────────────────────

export async function getDonations(filter = {}) {
  const db = await getDb();
  return db.collection('donations').find(filter).sort({ timestamp: -1 }).toArray();
}

export async function addDonation(donation) {
  const db = await getDb();
  return db.collection('donations').insertOne(donation);
}

export async function deleteDonationsByGame(gameName) {
  const db = await getDb();
  return db.collection('donations').deleteMany({ game: gameName });
}

// ── Licenses ──────────────────────────────────────────────────────────────────

export async function getLicenses() {
  const db = await getDb();
  return db.collection('licenses').find({}).toArray();
}

export async function addLicense(license) {
  const db = await getDb();
  return db.collection('licenses').insertOne(license);
}

// ── Helper functions ──────────────────────────────────────────────────────────

export function generateSecretKey() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk_live_';
  for (let i = 0; i < 32; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function generateGameSecretKey() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'gsk_';
  for (let i = 0; i < 32; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function generateLicenseId() {
  return `LIC_${Date.now().toString(36).toUpperCase()}`;
}

export function generateGameId() {
  return `game_${Date.now().toString(36)}`;
}

export function getDaysUntilExpire(expiresAt) {
  if (!expiresAt) return null;
  const now = new Date();
  const end = new Date(expiresAt);
  const diffTime = Math.abs(end - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isLicenseValid(license) {
  if (!license.active) return false;
  if (license.type === 'permanent') return true;
  if (license.expiresAt) {
    const now = new Date();
    return new Date(license.expiresAt) > now;
  }
  return false;
}
