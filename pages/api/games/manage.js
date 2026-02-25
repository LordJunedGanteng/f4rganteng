import {
  getGames,
  getGameById,
  addGame,
  updateGame,
  deleteGame,
  deleteDonationsByGame,
  generateGameSecretKey,
  generateGameId
} from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, gameId, name, robloxGameId, saweriaUsername, bagibaguUsername, isTemporary, duration } = req.body;

    if (action === 'list') {
      const games = await getGames();
      return res.status(200).json({ games });
    }

    if (action === 'add') {
      if (!name || !robloxGameId) {
        return res.status(400).json({ error: 'Game name dan Roblox ID harus diisi' });
      }

      const newGame = {
        id: generateGameId(),
        name,
        robloxGameId: parseInt(robloxGameId),
        saweriaUsername: saweriaUsername || null,
        bagibaguUsername: bagibaguUsername || null,
        isTemporary: isTemporary || false,
        expiresAt: isTemporary ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
        donations: 0,
        totalAmount: 0,
        secretKey: generateGameSecretKey(),
        addedAt: new Date().toISOString()
      };

      await addGame(newGame);
      return res.status(201).json({ success: true, game: newGame });
    }

    if (action === 'update') {
      if (!gameId) {
        return res.status(400).json({ error: 'Game ID required' });
      }

      const game = await getGameById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const updates = {};
      if (name) updates.name = name;
      if (robloxGameId) updates.robloxGameId = parseInt(robloxGameId);
      if (saweriaUsername !== undefined) updates.saweriaUsername = saweriaUsername;
      if (bagibaguUsername !== undefined) updates.bagibaguUsername = bagibaguUsername;

      await updateGame(gameId, updates);
      return res.status(200).json({ success: true, game: { ...game, ...updates } });
    }

    if (action === 'delete') {
      if (!gameId) {
        return res.status(400).json({ error: 'Game ID required' });
      }

      const game = await getGameById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      await deleteGame(gameId);
      await deleteDonationsByGame(game.name);
      return res.status(200).json({ success: true, message: 'Game deleted' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
