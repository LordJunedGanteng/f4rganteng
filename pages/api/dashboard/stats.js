import { getGames, getDonations } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const games = await getGames();
    const donationsList = await getDonations();

    const stats = {
      totalGames: games.length,
      totalDonations: donationsList.length,
      totalAmount: donationsList.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: donationsList.length > 0
        ? Math.round(donationsList.reduce((sum, d) => sum + d.amount, 0) / donationsList.length)
        : 0,
      games: games.map(g => {
        const gameDonations = donationsList.filter(d => d.game === g.name);
        return {
          id: g.id,
          name: g.name,
          robloxGameId: g.robloxGameId,
          donationCount: gameDonations.length,
          donationAmount: gameDonations.reduce((sum, d) => sum + d.amount, 0)
        };
      }),
      recentDonations: donationsList.slice(0, 10)
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
