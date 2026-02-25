import {
  addLicense,
  generateSecretKey,
  generateLicenseId,
} from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.body;

  if (!type || !['trial', 'permanent'].includes(type)) {
    return res.status(400).json({ error: 'Invalid license type' });
  }

  try {
    const secretKey = generateSecretKey();
    const licenseId = generateLicenseId();
    const createdAt = new Date();
    const expiresAt = type === 'trial'
      ? new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000)
      : null;

    const newLicense = {
      id: licenseId,
      secretKey,
      username: 'new_user',
      type,
      createdAt,
      expiresAt,
      active: true,
      games: [],
      totalDonations: 0,
      totalAmount: 0
    };

    await addLicense(newLicense);

    res.status(201).json({
      success: true,
      license: newLicense,
      message: `License ${type} berhasil dibuat`
    });
  } catch (error) {
    console.error('Generate license error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
