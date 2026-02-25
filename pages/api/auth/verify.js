export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', valid: false });
  }

  // Simple token validation
  // Dalam production, implement proper JWT verification
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username] = decoded.split(':');

    if (username) {
      return res.status(200).json({
        valid: true,
        username,
        authenticated: true
      });
    }

    return res.status(401).json({ error: 'Invalid token', valid: false });
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed', valid: false });
  }
}
