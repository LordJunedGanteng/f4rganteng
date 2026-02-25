// api/donations/[secretKey].js
// Roblox polling endpoint

import { getGameBySecretKey, getDonations } from '../../../lib/db';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { secretKey } = req.query;

  // ═══════════════════════════════════════════════════════════
  // GET: Roblox Polling
  // ═══════════════════════════════════════════════════════════
  if (req.method === 'GET') {
    try {
      const { since, limit } = req.query;

      const game = await getGameBySecretKey(secretKey);
      if (!game) {
        return res.status(404).json({
          ok: false,
          error: 'Game not found',
          donations: []
        });
      }

      const dbDonations = await getDonations({ game: game.name });
      let gameDonations = dbDonations.map(d => ({
        id: d.id,
        donor: d.donor,
        amount: d.amount,
        message: d.message || '',
        platform: d.platform,
        timestamp: d.timestamp,
        ts: new Date(d.timestamp).getTime(),
        matchedUsername: '',
        donorName: d.donor
      }));

      if (since) {
        const sinceTime = parseInt(since);
        gameDonations = gameDonations.filter(d => d.ts > sinceTime);
      }

      const limitNum = limit ? parseInt(limit) : 50;
      const result = gameDonations.slice(0, limitNum);
      const totalAmount = result.reduce((sum, d) => sum + (d.amount || 0), 0);

      console.log(`[Roblox Poll] Game: ${game.name}, Donations: ${result.length}, Total: Rp${totalAmount.toLocaleString('id-ID')}`);

      return res.status(200).json({
        ok: true,
        success: true,
        count: result.length,
        total: totalAmount,
        donations: result,
        game: {
          id: game.id,
          name: game.name,
          robloxGameId: game.robloxGameId
        },
        cached_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ GET error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to fetch donations',
        message: error.message,
        donations: []
      });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
