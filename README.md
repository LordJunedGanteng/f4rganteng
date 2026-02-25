# 🎮 Saweria Roblox Integration System

Sistem penjualan license untuk integrasi Roblox dengan Saweria donation tracking.

## 📋 Fitur Utama

✅ **Login Dashboard** - Admin panel dengan authentication  
✅ **License Management** - Generate dan manage license dengan secret key  
✅ **Trial & Permanent License** - Pilihan 10 hari trial atau selamanya  
✅ **Dashboard Stats** - Total games, donasi, amount, dan rata-rata donasi  
✅ **Data Backup** - Export data donasi ke JSON  
✅ **Modern Design** - UI yang responsif dan elegant  

## 🔐 Login Credentials

```
Username: rkdkcw
Password: admin@123
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Buat file `.env.local` di root directory:

```env
ROBLOX_API_KEY=your_api_key_here
UNIVERSE_ID=your_universe_id_here
MESSAGING_TOPIC=Donations
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📖 Pages & Routes

### Public Routes
- `/auth/login` - Login page

### Protected Routes (Require Authentication)
- `/` - Redirect ke dashboard atau login
- `/dashboard` - Main dashboard dengan stats dan license generation
- `/licenses` - Daftar semua license yang telah dibuat

## 🔑 License System

### Tipe License

#### 1. **Permanent License** 🔓
- Berlaku selamanya
- Tidak ada batasan waktu
- Cocok untuk customer yang membeli full version

#### 2. **Trial License** ⏱️
- Berlaku 10 hari
- Otomatis expire setelah 10 hari
- Cocok untuk customer yang ingin coba terlebih dahulu

### Struktur License

Setiap license memiliki:
```
License ID: LIC_001
Secret Key: sk_live_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
Type: permanent | trial
Status: active | inactive
Created At: YYYY-MM-DD
Expires At: YYYY-MM-DD | null (untuk permanent)
```

## 📊 Dashboard Features

### Stats Cards
- **Total Game** - Jumlah game yang terdaftar
- **Total Donasi** - Jumlah uang donasi yang masuk
- **Jumlah Donatur** - Jumlah transaksi donasi
- **Rata-rata Donasi** - Average per donation

### Games Section
Menampilkan semua game dengan:
- Nama game
- Jumlah donasi
- Total amount
- Copy button untuk copy data

### Recent Donations Table
Tabel dengan kolom:
- Game
- Donatur
- Jumlah
- Platform (saweria/bagibagi)
- Tanggal

## 💾 Data Management

### Backup Data
Click "📥 Backup Data" di dashboard untuk export semua data dalam format JSON.

File akan di-download sebagai: `saweria-backup-{timestamp}.json`

### Data Structure

```json
{
  "stats": {
    "totalGames": 2,
    "totalDonations": 10,
    "totalAmount": 1070000,
    "games": [
      {
        "id": "game_001",
        "name": "Zerolution",
        "donations": 5,
        "totalAmount": 310000
      }
    ],
    "recentDonations": [
      {
        "id": "don_001",
        "game": "Zerolution",
        "donor": "TANWIAA",
        "amount": 50000,
        "platform": "saweria",
        "timestamp": "2026-02-20T14:57:13"
      }
    ]
  },
  "exportedAt": "2026-02-20T10:30:45.123Z"
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user  
- `GET /api/auth/verify` - Verify token (optional)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Games Management  
- `GET /api/games/manage?action=list` - List all registered games
- `POST /api/games/manage?action=add` - Register a new game
- `POST /api/games/manage?action=update` - Update game configuration  
- `POST /api/games/manage?action=delete` - Delete a game

### License Management
- `POST /api/licenses/generate` - Generate new license
- `GET /api/licenses/list` - List all licenses

### Donations (Webhook & Polling)
- `POST /api/donations?platform=saweria&secretKey={key}` - Saweria webhook endpoint
- `POST /api/donations?platform=bagibagi&secretKey={key}` - BagiBagi webhook endpoint
- `GET /api/donations` - Get all donations (for Roblox polling)
- `GET /api/donations?since={timestamp}&limit={count}` - Get donations since timestamp
- `GET /api/donations/[secretKey]` - Get donations for specific game

## ⚙️ Setup Instructions

### 1. Register a New Game
1. Go to **Games** page in dashboard
2. Click **"➕ Add Game"** button  
3. Fill in:
   - Game Name (your game's display name)
   - Roblox Game ID (the universe ID)
   - Saweria Username (optional)
   - BagiBagi Username (optional)
   - Toggle "Temporary" if trial license
4. Click **"Create Game"**
5. A new **secretKey** will be auto-generated

### 2. Setup Webhook Integration
After registering a game, you'll see the **Integration Setup** modal with two webhook URLs:

**For Saweria:**
```
https://your-domain/api/donations?platform=saweria&secretKey={YOUR_SECRET_KEY}
```
1. Go to Saweria Dashboard
2. Add this URL as webhook endpoint
3. Donations will be received automatically

**For BagiBagi:**
```  
https://your-domain/api/donations?platform=bagibagi&secretKey={YOUR_SECRET_KEY}
```
1. Go to BagiBagi Dashboard
2. Add this URL as webhook endpoint
3. Donations will be received automatically

### 3. Setup Roblox Polling Script
Your Roblox games can fetch donations via HTTP polling:

1. Get the polling script from `/RobloxSaweria/ServerScriptService/SaweriaListener.lua`
2. In the script, set:
   ```lua
   local API_URL = "https://your-domain/api/donations"
   ```
3. Place script in ServerScriptService of your game
4. The script will:
   - Poll every 15 seconds for new donations
   - Fire RemoteEvents for leaderboard updates
   - Trigger notifications for new donations
   - Skip duplicates via deduplication

## 🎯 Cara Menggunakan

### 1. Login
1. Buka `http://localhost:3000`
2. Masukkan username: `rkdkcw`
3. Masukkan password: `admin@123`
4. Click "Masuk"

### 2. Register Game  
1. Go to **Games** page
2. Click **"➕ Add Game"**
3. Fill in game details
4. Copy webhook URLs for Saweria/BagiBagi integration

### 3. Monitor Donations
- Lihat semua games di **Games** page
- Lihat donasi terbaru di **Dashboard**
- Check stats untuk overview

### 4. Backup Data
1. Click "📥 Backup Data"
2. File JSON akan otomatis di-download
3. Simpan untuk keperluan backup

## 🛠️ Teknologi yang Digunakan

- **Next.js 14** - React framework
- **React 18** - UI library
- **Pure CSS** - Styling (no external UI library needed)
- **API Routes** - Backend untuk API

## 📦 Project Structure

```
pages/
├── index.js                    # Redirect to dashboard
├── auth/
│   └── login.js               # Login page
├── dashboard/
│   └── index.js               # Main dashboard
├── licenses/
│   └── index.js               # License management
├── api/
│   ├── auth/
│   │   └── login.js           # Login API
│   ├── dashboard/
│   │   └── stats.js           # Dashboard stats API
│   ├── licenses/
│   │   ├── generate.js        # Generate license API
│   │   └── list.js            # List licenses API
│   ├── donations.js           # Donations API
│   ├── status.js              # Status check API
│   └── ...
├── _document.js               # Global document setup
└── ...

lib/
└── db.js                       # Database utilities & data

styles/
└── (embedded in components)    # Inline CSS styling
```

## 🔐 Security Considerations

⚠️ **Penting untuk Production:**

1. **Jangan hardcode credentials**
   - Gunakan environment variables
   - Implementasi proper database

2. **Gunakan JWT untuk tokens**
   - Library: `jsonwebtoken`
   - Set proper expiration

3. **Database**
   - Simpan licenses di database real
   - Encrypt secret keys
   - Backup regular

4. **HTTPS**
   - Deploy dengan HTTPS
   - Implement CORS properly

5. **Rate Limiting**
   - Add rate limiting pada API endpoints
   - Prevent brute force attacks

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ROBLOX_API_KEY` | Roblox API key untuk messaging | Yes |
| `UNIVERSE_ID` | Roblox universe ID | Yes |
| `MESSAGING_TOPIC` | Roblox messaging topic | No (default: `Donations`) |
| `NODE_ENV` | Development/production mode | No (default: `development`) |

## 🚨 Troubleshooting

### License tidak bisa di-generate
- Check apakah token valid
- Lihat browser console untuk error messages
- Ensure server berjalan dengan baik

### Dashboard tidak load data
- Clear browser cache (Ctrl+Shift+Delete)
- Check localStorage apakah token tersisma
- Ensure API endpoints accessible

### Styling tidak benar
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser support untuk CSS gradients

## 📞 Support

Untuk pertanyaan teknis atau issues, silakan create issue atau hubungi developer.

---

**Last Updated:** February 20, 2026  
**Version:** 1.0.0
