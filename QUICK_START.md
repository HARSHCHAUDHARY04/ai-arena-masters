# 🚀 Quick Start Guide

## Fastest Way to Get Running (5 minutes)

### Prerequisites
- Node.js 18+ and npm installed
- MongoDB installed locally (or MongoDB Atlas account)

---

## Windows - Super Quick Start

```powershell
# 1. Run setup (does everything automatically)
.\SETUP.bat

# 2. Two terminals, run these in parallel:
# Terminal 1:
cd server
npm run dev

# Terminal 2:
npm run dev

# 3. Open browser to http://localhost:8080
# 4. Login: admin@example.com / admin123
```

---

## Mac/Linux - Super Quick Start

```bash
# 1. Run setup (does everything automatically)
bash SETUP.sh

# 2. Two terminals, run these in parallel:
# Terminal 1:
cd server
npm run dev

# Terminal 2:
npm run dev

# 3. Open browser to http://localhost:8080
# 4. Login: admin@example.com / admin123
```

---

## What If MongoDB Isn't Running?

### Windows
```powershell
# Start MongoDB (if installed as service, should auto-start)
# Or manually start:
mongod

# Check if running:
netstat -ano | findstr :27017
```

### Mac/Linux
```bash
# Start MongoDB
brew services start mongodb-community

# Or manually:
mongod

# Check if running:
lsof -i :27017
```

### Use MongoDB Atlas (Cloud) Instead
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_arena
   ```

---

## Login Credentials

```
Email:    admin@example.com
Password: admin123
```

**Change these after first login!**

---

## URLs to Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:4000 |
| Database | localhost:27017 |

---

## Troubleshooting

### "Connection refused" error
- MongoDB isn't running
- Run: `mongod` in another terminal

### "Port 4000 already in use"
- Another app is using port 4000
- Edit `server/.env` and change PORT to 5000

### "Cannot find npm"
- Node.js isn't installed
- Download from: https://nodejs.org/

### "Login failed"
- Clear browser cache: Ctrl+Shift+Delete (Chrome/Edge)
- Or run in incognito window
- Check backend is running on port 4000

---

## Creating Additional Users

In admin panel:
1. Go to Admin page
2. Click "Create User"
3. Enter email and password
4. Select role: Admin, Organizer, or Participant
5. Click Create

---

## Creating an Event

As Organizer:
1. Go to Organizer page
2. Click "Create Event"
3. Fill in event details
4. Set problem statement and rules
5. Click Create

---

## Testing the System

1. **Create multiple users** with different roles
2. **Create an event** as organizer
3. **Submit API** endpoint as participant
4. **View scoreboard** to see live results
5. **Check analytics** in admin dashboard

---

## Next Steps

After quick start:
1. Read `MONGODB_MIGRATION.md` for technical details
2. Read `README_MONGODB.md` for full documentation
3. Customize for your use case
4. Deploy to production (change credentials!)
5. Set up SSL/TLS for HTTPS

---

## Common Commands

```powershell
# Start backend
cd server && npm run dev

# Start frontend
npm run dev

# Seed database with test data
cd server && npm run seed

# Start both (requires 2 terminals)
# Terminal 1: cd server && npm run dev
# Terminal 2: npm run dev

# Reset database
# Delete MongoDB database "ai_arena" and run seed again
```

---

## File Structure

```
project/
├── src/                    # React frontend
├── server/                 # Express backend
│   ├── index.js           # Main server
│   ├── seed.js            # Database seeding
│   └── .env               # Backend config
├── .env                   # Frontend config
└── SETUP.bat/.sh          # Setup automation
```

---

## That's It!

You're now running:
- ✅ React frontend
- ✅ Express backend
- ✅ MongoDB database

All migrations complete. All features working.

**Ready to build! 🚀**

---

## Need Help?

1. **Technical details**: Read `MONGODB_MIGRATION.md`
2. **Full docs**: Read `README_MONGODB.md`
3. **Migration info**: Read `MIGRATION_COMPLETE.md`
4. **API reference**: Check `server/index.js`

---

**Happy coding!** 🎉
