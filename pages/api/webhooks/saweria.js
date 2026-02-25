import { getGameBySecretKey, addDonation, incrementGameStats } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secretKey } = req.query;
    const { name, amount, message } = req.body;

    const game = await getGameBySecretKey(secretKey);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!name || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid donation data' });
    }

    const donation = {
      id: `don_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      game: game.name,
      donor: name,
      amount: parseInt(amount),
      message: message || '',
      platform: 'saweria',
      timestamp: new Date().toISOString()
    };

    await addDonation(donation);
    await incrementGameStats(game.id, parseInt(amount));

    console.log(`[Saweria] Donation received for "${game.name}": ${name} → Rp ${amount}`);

    res.status(200).json({
      success: true,
      donation,
      game: {
        name: game.name,
        robloxGameId: game.robloxGameId
      }
    });
  } catch (err) {
    console.error('Saweria webhook error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
