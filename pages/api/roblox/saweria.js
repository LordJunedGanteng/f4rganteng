/**
 * Roblox Saweria Integration API
 * Handle Saweria listener and user registration
 */

import { robloxConfig } from '@/roblox/config/env.js';

// Store user mappings (replace with actual database)
const userMappings = new Map();

export default function handler(req, res) {
  // Validate API key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== robloxConfig.secretKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method, query } = req;
  const action = query.action || req.body?.action;

  if (method === 'GET') {
    if (action === 'listener') {
      return res.status(200).json({
        success: true,
        message: 'Saweria Listener active',
        wsUrl: robloxConfig.ws.url,
        status: 'connected',
      });
    }

    if (action === 'users') {
      const users = Array.from(userMappings.entries()).map(([robloxId, saweriaId]) => ({
        robloxId,
        saweriaId,
      }));

      return res.status(200).json({
        success: true,
        data: users,
        total: users.length,
      });
    }
  }

  if (method === 'POST') {
    if (action === 'register') {
      const { robloxId, saweriaId } = req.body;

      if (!robloxId || !saweriaId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'robloxId and saweriaId are required',
        });
      }

      // Register mapping
      userMappings.set(robloxId, saweriaId);

      return res.status(200).json({
        success: true,
        message: 'User registered successfully',
        data: {
          robloxId,
          saweriaId,
        },
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
