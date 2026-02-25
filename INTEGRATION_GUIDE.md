# 🚀 Saweria Roblox Integration Guide

Complete setup guide for integrating Saweria & BagiBagi donations into your Roblox games.

## 🔑 Quick Overview

This system has 3 main components:

1. **Admin Dashboard** - Manage games, view donations, configure webhooks
2. **Donation Webhooks** - Receive donations from Saweria & BagiBagi  
3. **Roblox Polling** - Games fetch donations via HTTP polling

---

## 📋 Step-by-Step Setup

### Phase 1: Register Your Game (Admin Dashboard)

1. **Sign In**
   - Go to `https://your-domain/`
   - Username: `rkdkcw`
   - Password: `admin@123`

2. **Navigate to Games**
   - Click "Games" in the sidebar

3. **Add a New Game**
   - Click "➕ Add Game" button
   - Fill in game details:
     ```
     Game Name:         [Your Game Name]
     Roblox Game ID:    [Universe ID from Roblox Developer Console]
     Saweria Username:  [your-saweria-username]  (optional)
     BagiBagi Username: [your-bagibagi-username] (optional)
     ```
   - Optional: Check "Temporary" if it's a trial (set duration in days)
   - Click "Create Game"

4. **Note the Secret Key**
   - A secret key will be auto-generated: `gsk_xxxxx...`
   - Save this for webhook configuration

---

### Phase 2: Setup Payment Platform Webhooks

#### For Saweria Integration:

1. Go to [Saweria.co Dashboard](https://saweria.co)
2. Find Webhook Settings
3. Add new webhook endpoint:
   ```
   https://your-domain/api/donations?platform=saweria&secretKey=YOUR_SECRET_KEY
   ```
4. Select events: "Donation Created" or similar
5. Save and test

#### For BagiBagi Integration:

1. Go to BagiBagi.us Dashboard  
2. Find Integration/Webhook settings
3. Add new webhook endpoint:
   ```
   https://your-domain/api/donations?platform=bagibagi&secretKey=YOUR_SECRET_KEY
   ```
4. Select events: "Donation Received"
5. Save and test

**Note:** Click "Copy" in the Integration Setup modal to copy the exact URLs!

---

### Phase 3: Setup Roblox Game Script

#### Copy the Polling Script:

Use the provided script from `/RobloxSaweria/ServerScriptService/SaweriaListener.lua`

#### Configure API URL:

In the script, find and update:
```lua
local API_URL = "https://your-domain/api/donations"
local GAME_ID = "your_roblox_game_id"  -- optional, for logging
```

#### Place in Your Game:

1. Open your Roblox Game in Studio
2. Go to **ServerScriptService**
3. Create a new **Script** (not LocalScript)
4. Paste the polling script
5. Replace API_URL and GAME_ID
6. Save and publish

#### How It Works:

- Script polls `/api/donations` every 15 seconds
- Automatically deduplicates donations (no duplicates within same poll cycle)
- Fires two RemoteEvents:
  - **UpdateLeaderboard** - Updates top donors
  - **NewDonation** - Triggers notification for new donation

---

## 📡 API Endpoints Reference

### GET Polling Endpoint

```
GET /api/donations
GET /api/donations?since=2024-02-21T10:30:00Z&limit=50
GET /api/donations?since=1708520400000&limit=50
```

**Response Format:**
```json
{
  "success": true,
  "donations": [
    {
      "id": "don_12345",
      "donor": "Donor Name",
      "amount": 50000,
      "message": "Thank you!",
      "created_at": "2024-02-21T10:30:00Z",
      "platform": "saweria"
    }
  ],
  "count": 1,
  "total": 50000
}
```

### POST Webhook Endpoints

```
POST /api/donations?platform=saweria&secretKey=YOUR_SECRET_KEY
POST /api/donations?platform=bagibagi&secretKey=YOUR_SECRET_KEY
```

**Webhook Payload from Saweria:**
```json
{
  "id": "donation_123",
  "donator_name": "John Doe",
  "amount_raw": 50000,
  "message": "Great game!",
  "created_at": "2024-02-21T10:30:00Z"
}
```

**Webhook Payload from BagiBagi:**
```json
{
  "id": "donation_456",
  "supporter_name": "Jane Smith",
  "amount": 100000,
  "comment": "Keep it up!",
  "created_at": "2024-02-21T10:30:00Z"
}
```

---

## 🔍 Monitoring & Troubleshooting

### Check Donations in Admin Panel

1. Go to **Dashboard** 
2. See "💳 Donasi Terbaru" section
3. See "🎮 Game yang Terdaftar" with donation counts

### Debug Webhook Reception

- Check server logs: Look for "💰 DONASI BARU" messages
- Verify platform field matches (saweria/bagibagi)
- Check secretKey matches your game's key

### Debug Roblox Polling

- Roblox script logs polling activity
- Check browser console if using HTTP requests
- Ensure API_URL is correct and game is running

---

## 🔐 Session & Security

### Admin Panel Session Timeout

- Sessions timeout after **5 minutes** of inactivity
- Activity is detected via: mouse movement, keyboard input, scrolling, touch
- Logout page will appear when session expires
- All data in localStorage is cleared on logout

### Secret Keys

- Each game gets a unique **secret key** (`gsk_xxxxx`)
- Use this key in webhook URLs for Saweria/BagiBagi
- **DO NOT** share your secret key publicly
- Secret keys can't be reset - delete and recreate game if compromised

---

## 📊 Response Field Mapping

The system normalizes donation fields from different platforms:

| Saweria Field | BagiBagi Field | Unified Field |
|---|---|---|
| `donator_name` | `supporter_name` | `donor` |
| `amount_raw` | `amount` | `amount` |  
| `message` | `comment` | `message` |
| `created_at` | `created_at` | `created_at` |
| (auto) | (auto) | `platform` |

---

## ⚙️ Environment Variables (Optional)

```env
# Discord webhook forwarding (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Roblox MessagingService (currently unused, using polling instead)
ROBLOX_API_KEY=your_roblox_api_key
UNIVERSE_ID=your_universe_id
MESSAGING_TOPIC=Donations
```

---

## ✅ Checklist: Complete Setup

- [ ] Admin account created (rkdkcw / admin@123)
- [ ] Game registered in admin dashboard
- [ ] Secret key noted and saved
- [ ] Saweria webhook configured (if using Saweria)
- [ ] BagiBagi webhook configured (if using BagiBagi)
- [ ] Roblox polling script installed in ServerScriptService
- [ ] API_URL configured in Roblox script
- [ ] Test donation received from Saweria/BagiBagi
- [ ] Donation appears in admin dashboard
- [ ] Roblox game receives donation (leaderboard updates)

---

## 🆘 Common Issues

### "Game not found" Error on Webhook

**Issue:** Webhook returns 404 error  
**Solution:** Verify secretKey is correct in webhook URL

### Donations Not Appearing

**Issue:** Donation sent, but doesn't show in dashboard  
**Solution:**
- Check webhook status at Saweria/BagiBagi
- Verify secretKey matches game's key
- Check server logs for error messages
- Test with sample payload via curl/Postman

### Roblox Script Not Polling

**Issue:** Game not receiving donations  
**Solution:**
- Check API_URL is correct and accessible from Roblox  
- Verify HTTPS is used (not HTTP)
- Check Roblox Output for errors
- Ensure game is running on Studio/published

### Session Timeout Issues

**Issue:** Got logged out unexpectedly  
**Solution:**
- This is expected after 5 minutes of inactivity
- Scroll, click, or type to reset the 5-minute timer
- Session tracks: mouse down, key press, scroll, touch

---

## 🔗 Quick Links

- **Admin Dashboard:** `https://your-domain/`
- **Games Management:** `https://your-domain/dashboard/games`
- **Check API Status:** `https://your-domain/api/donations`
- **GitHub Repo:** [Your Repo URL]

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed errors
3. Verify all webhook URLs are correct
4. Test with curl/Postman: `curl https://your-domain/api/donations`

---

**Last Updated:** February 2024  
**Version:** 1.0  
**Framework:** Next.js + Roblox Lua
