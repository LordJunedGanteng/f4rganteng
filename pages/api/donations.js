// api/donations.js
// Endpoint unified untuk webhook Saweria & BagiBagi

import {
  getGameBySecretKey,
  incrementGameStats,
  addDonation,
  getDonations
} from '../../lib/db';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Source, X-Platform');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ═══════════════════════════════════════════════════════════
  // POST: Webhook dari Saweria atau BagiBagi
  // ═══════════════════════════════════════════════════════════
  if (req.method === 'POST') {
    try {
      const data = req.body;
      const platform = req.query.platform || req.headers['x-platform'] || 'saweria';
      const secretKey = req.query.secretKey;

      if (!data || typeof data !== 'object') {
        console.warn('⚠️ Invalid webhook payload');
        return res.status(400).json({ error: 'Invalid payload' });
      }

      // Normalize field names berdasarkan platform
      let donorName, donationAmount, donationMessage;

      if (platform === 'bagibagi') {
        donorName = data.name || data.supporter_name || data.donor_name || 'Anonymous';
        donationAmount = data.amount || 0;
        donationMessage = data.message || data.comment || '';
      } else {
        donorName = data.donator_name || data.donor_name || data.donor || 'Anonymous';
        donationAmount = data.amount_raw || data.amount || 0;
        donationMessage = data.message || data.note || '';
      }

      const donation = {
        id: data.id || `don_${Date.now()}`,
        donor: donorName,
        amount: parseInt(donationAmount),
        message: donationMessage,
        created_at: data.created_at || new Date().toISOString(),
        source: platform,
        secretKey: secretKey || null
      };

      if (donation.amount <= 0) {
        console.warn('⚠️ Invalid amount:', donation.amount);
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Cari game berdasarkan secret key
      let targetGame = null;
      if (secretKey) {
        targetGame = await getGameBySecretKey(secretKey);
      }

      console.log('═══════════════════════════════════════════');
      console.log(`💰 DONASI BARU dari ${platform.toUpperCase()}!`);
      console.log('Donor:', donation.donor);
      console.log('Amount:', 'Rp' + donation.amount.toLocaleString('id-ID'));
      console.log('Message:', donation.message || '-');
      if (targetGame) console.log('Game:', targetGame.name);
      console.log('═══════════════════════════════════════════');

      // ─────────────────────────────────────────────────────────
      // Simpan ke MongoDB
      // ─────────────────────────────────────────────────────────
      if (targetGame) {
        await incrementGameStats(targetGame.id, donation.amount);

        await addDonation({
          id: donation.id,
          game: targetGame.name,
          donor: donation.donor,
          amount: donation.amount,
          message: donation.message,
          platform: platform,
          timestamp: donation.created_at
        });
      }

      // ─────────────────────────────────────────────────────────
      // Kirim ke Roblox MessagingService
      // ─────────────────────────────────────────────────────────
      const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
      const UNIVERSE_ID = targetGame?.robloxGameId || process.env.UNIVERSE_ID;
      const MESSAGING_TOPIC = process.env.MESSAGING_TOPIC || 'Donations';

      if (ROBLOX_API_KEY && UNIVERSE_ID) {
        try {
          console.log('📤 Mengirim ke Roblox...');
          console.log('Universe ID:', UNIVERSE_ID);
          console.log('Topic:', MESSAGING_TOPIC);

          const messageString = JSON.stringify({
            donor: donation.donor,
            amount: donation.amount,
            message: donation.message,
            created_at: donation.created_at,
            id: donation.id,
            platform: platform,
            game: targetGame?.name || 'Unknown'
          });

          console.log('Message to send:', messageString);

          const requestBody = { message: messageString };

          console.log('Request body:', JSON.stringify(requestBody));

          const robloxResponse = await fetch(
            `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/${MESSAGING_TOPIC}`,
            {
              method: 'POST',
              headers: {
                'x-api-key': ROBLOX_API_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            }
          );

          const responseText = await robloxResponse.text();
          console.log('Roblox response status:', robloxResponse.status);
          console.log('Roblox response body:', responseText);

          if (!robloxResponse.ok) {
            console.error('❌ Roblox API Error:', robloxResponse.status);
            console.error('Response:', responseText);
          } else {
            console.log('✅ Berhasil dikirim ke Roblox!');
          }
        } catch (robloxError) {
          console.error('❌ Roblox send error:', robloxError);
          console.error('Error stack:', robloxError.stack);
        }
      } else {
        console.warn('⚠️ Roblox credentials belum di-set');
        console.warn('ROBLOX_API_KEY:', ROBLOX_API_KEY ? 'Set' : 'Missing');
        console.warn('UNIVERSE_ID:', UNIVERSE_ID ? 'Set' : 'Missing');
      }

      // ─────────────────────────────────────────────────────────
      // (Opsional) Forward ke Discord
      // ─────────────────────────────────────────────────────────
      const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

      if (DISCORD_WEBHOOK_URL) {
        try {
          await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: `💎 Donasi Baru dari ${platform.toUpperCase()}!`,
                color: platform === 'bagibagi' ? 0xf59e0b : 0x9333ea,
                fields: [
                  { name: "Donor", value: donation.donor, inline: true },
                  { name: "Amount", value: `Rp ${donation.amount.toLocaleString('id-ID')}`, inline: true },
                  { name: "Game", value: targetGame?.name || "Unknown", inline: true },
                  { name: "Message", value: donation.message || "_No message_", inline: false }
                ],
                timestamp: donation.created_at,
                footer: { text: `${platform} Webhook` }
              }]
            })
          });
          console.log('✅ Forwarded to Discord');
        } catch (discordError) {
          console.error('⚠️ Discord forward failed:', discordError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Donation received',
        id: donation.id,
        game: targetGame?.name || null
      });

    } catch (error) {
      console.error('💥 Webhook error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET: Untuk Roblox polling & frontend
  // ═══════════════════════════════════════════════════════════
  if (req.method === 'GET') {
    try {
      const { since, limit, secretKey } = req.query;

      let recentDonations;

      if (secretKey) {
        const game = await getGameBySecretKey(secretKey);
        if (!game) {
          return res.status(404).json({ success: false, error: 'Game not found', donations: [] });
        }

        const dbDonations = await getDonations({ game: game.name });
        recentDonations = dbDonations.map(d => ({
          id: d.id,
          donor: d.donor,
          amount: d.amount,
          message: d.message,
          created_at: d.timestamp,
          platform: d.platform
        }));
      } else {
        const dbDonations = await getDonations();
        recentDonations = dbDonations.map(d => ({
          id: d.id,
          donor: d.donor,
          amount: d.amount,
          message: d.message,
          created_at: d.timestamp,
          platform: d.platform || d.source
        }));
      }

      if (since) {
        let sinceTime;
        if (isNaN(since)) {
          sinceTime = new Date(since).getTime();
        } else {
          sinceTime = parseInt(since);
        }

        recentDonations = recentDonations.filter(d => {
          const donationTime = new Date(d.created_at).getTime();
          return donationTime > sinceTime;
        });
      }

      const limitNum = limit ? parseInt(limit) : 50;
      const result = recentDonations.slice(0, limitNum);
      const totalAmount = result.reduce((sum, d) => sum + (d.amount || 0), 0);

      return res.status(200).json({
        success: true,
        donations: result,
        count: result.length,
        total: totalAmount
      });
    } catch (error) {
      console.error('💥 GET error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to fetch donations',
        message: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
