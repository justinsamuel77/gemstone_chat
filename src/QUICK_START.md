# ⚡ QUICK START - Fix "Failed to fetch" Errors

## 🚨 CRITICAL: Your server is not running!

The "Failed to fetch" error means the Node.js backend server is not running. Here's how to fix it:

## 🎯 Solution (Choose ONE):

### Option 1: Auto-Start (Recommended)
```bash
npm run start:all
```

### Option 2: Manual Start (Better for troubleshooting)
**Terminal 1:**
```bash
npm run server:dev
```
**Wait for:** `✅ Server running successfully on port 3001`

**Terminal 2:**
```bash
npm run dev
```

## ✅ How to Verify It's Working

1. **Test the server:**
   ```bash
   npm run test-server
   ```
   Should show: `✅ Server is running and responding correctly!`

2. **Open the app:**
   Go to http://localhost:5173
   
3. **Try to sign in:**
   The "Failed to fetch" error should be gone!

## 🚨 If It Still Doesn't Work

### Quick Fixes:
```bash
# Kill any process using port 3001
lsof -ti:3001 | xargs kill -9

# Check your setup
npm run check-setup

# Reinstall dependencies
npm install
```

### Check Environment:
Make sure you have a `.env` file with:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

## 📚 Need More Help?

- **Detailed guide:** See `STARTUP_CHECKLIST.md`
- **Troubleshooting:** See `TROUBLESHOOTING.md`
- **Full documentation:** See `README.md`

---

**🎯 Remember: You MUST run the server first, then the frontend will work!**