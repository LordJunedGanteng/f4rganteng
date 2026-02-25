/**
 * Roblox Leaderboard API
 * Handle leaderboard data operations
 */

import { robloxConfig } from '@/roblox/config/env.js';

// Dummy data - replace with actual database
const leaderboardData = [
  {
    id: 1,
    username: 'PlayerOne',
    contribution: 50,
    total: 500000,
    status: 'active',
    lastDonation: new Date(),
  },
  {
    id: 2,
    username: 'PlayerTwo',
    contribution: 40,
    total: 400000,
    status: 'active',
    lastDonation: new Date(),
  },
  {
    id: 3,
    username: 'PlayerThree',
    contribution: 30,
    total: 300000,
    status: 'inactive',
    lastDonation: new Date(),
  },
];

export default function handler(req, res) {
  // Validate API key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== robloxConfig.secretKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;

  if (method === 'GET') {
    const { limit = 50, offset = 0 } = req.query;

    // Sort by total contribution
    const sorted = leaderboardData.sort((a, b) => b.total - a.total);
    const paginated = sorted.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      data: paginated,
      total: sorted.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  if (method === 'POST') {
    const { userId, contribution, message } = req.body;

    // Validate input
    if (!userId || !contribution) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId and contribution are required',
      });
    }

    // Find or create user entry
    let entry = leaderboardData.find((e) => e.id === userId);
    if (!entry) {
      entry = {
        id: userId,
        username: `Player${userId}`,
        contribution: 0,
        total: 0,
        status: 'active',
      };
      leaderboardData.push(entry);
    }

    // Update contribution
    entry.contribution = (entry.contribution || 0) + contribution;
    entry.total = (entry.total || 0) + contribution;
    entry.lastDonation = new Date();

    return res.status(200).json({
      success: true,
      message: 'Leaderboard updated',
      data: entry,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
