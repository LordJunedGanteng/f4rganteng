import { getGameBySecretKey, addDonation, incrementGameStats } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secretKey } = req.query;
    const { name, supporter_name, donor_name, amount, message, comment } = req.body;

    const donorName = name || supporter_name || donor_name;
    const donationAmount = amount;
    const donationMessage = message || comment;

    const game = await getGameBySecretKey(secretKey);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!donorName || !donationAmount || donationAmount <= 0) {
      return res.status(400).json({ error: 'Invalid donation data' });
    }

    const donation = {
      id: `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      game: game.name,
      donor: donorName,
      amount: parseInt(donationAmount),
      message: donationMessage || '',
      platform: 'bagibagi',
      timestamp: new Date().toISOString()
    };

    await addDonation(donation);
    await incrementGameStats(game.id, parseInt(donationAmount));

    console.log(`[BagiBagi] Donation received for "${game.name}": ${donorName} → Rp ${donationAmount}`);

    res.status(200).json({
      success: true,
      donation,
      game: {
        name: game.name,
        robloxGameId: game.robloxGameId
      }
    });
  } catch (err) {
    console.error('BagiBagi webhook error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
