/**
 * Roblox System API Hub
 * Main handler untuk semua roblox-related API calls
 */

import { robloxConfig, validateSecretKey } from '@/roblox/config/env.js';

export default function handler(req, res) {
  // Validate secret key
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== robloxConfig.secretKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key',
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Roblox System API',
      version: '1.0.0',
      endpoints: {
        leaderboard: '/api/roblox/leaderboard',
        saweria: '/api/roblox/saweria',
        users: '/api/roblox/users',
      },
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
