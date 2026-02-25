export const robloxConfig = {
  secretKey: process.env.ROBLOX_API_KEY || '',
  ws: { url: process.env.ROBLOX_WS_URL || '' }
};

export function validateSecretKey(key) {
  return key === robloxConfig.secretKey;
}
