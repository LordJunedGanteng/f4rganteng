export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Hardcoded credentials untuk demo
  const validUsername = 'rkdkcw';
  const validPassword = 'admin@123';

  if (username === validUsername && password === validPassword) {
    // Generate simple token (dalam production gunakan JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      success: true,
      token,
      user: {
        username,
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ error: 'Username atau password salah' });
}
