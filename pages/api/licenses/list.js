import { getLicenses, isLicenseValid, getDaysUntilExpire } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const licenses = await getLicenses();

    const licensesData = licenses.map(lic => ({
      id: lic.id,
      type: lic.type,
      active: lic.active,
      createdAt: lic.createdAt,
      expiresAt: lic.expiresAt,
      daysLeft: getDaysUntilExpire(lic.expiresAt),
      isValid: isLicenseValid(lic),
      statsCount: {
        games: lic.games?.length || 0,
        totalAmount: lic.totalAmount || 0
      }
    }));

    res.status(200).json({
      success: true,
      licenses: licensesData,
      total: licensesData.length
    });
  } catch (error) {
    console.error('List licenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
