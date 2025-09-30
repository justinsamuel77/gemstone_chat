# 🚀 STARTUP CHECKLIST - Fix "Failed to fetch" Errors

## ⚠️ CRITICAL: The server must be running before the frontend will work!

Follow these steps **in order** to fix the "Failed to fetch" errors:

## Step 1: Verify Your Setup

```bash
# Check if everything is configured correctly
npm run check-setup
```

If this shows any ❌ errors, fix them first before continuing.

## Step 2: Test if Server is Already Running

```bash
# Test if server is responding
npm run test-server
```

If this shows ✅, your server is working! Skip to Step 5.

## Step 3: Start the Server (Choose ONE option)

### Option A: Start Both Servers at Once (Recommended)
```bash
npm run start:all
```

### Option B: Start Servers Separately (Better for debugging)

**Terminal 1 - Start Backend:**
```bash
npm run server:dev
```
**Wait for this message:** `✅ Server running successfully on port 3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

## Step 4: Verify Server is Working

```bash
# Test server connectivity
npm run test-server
```

You should see:
```
✅ Server is running and responding correctly!
📊 Response: {
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0"
}
🎉 Your server is working properly!
```

## Step 5: Test the Application

1. **Open your browser**: http://localhost:5173
2. **Try to sign in** - the "Failed to fetch" error should be gone!

## 🚨 If Server Won't Start

### Check Port 3001 Usage:
```bash
# See what's using port 3001
lsof -i :3001

# Kill any process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Check Environment Variables:
```bash
# Verify .env file exists and has content
cat .env

# Should contain:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your_key_here
# SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

### Try Manual Server Start:
```bash
# Start server with debugging
DEBUG=* npm run server:dev
```

### Check Server Logs:
Look for these success messages:
```
🚀 Starting GEMSTONE CRM Server on port 3001
✅ Port 3001 is available
🔧 Environment Configuration:
   SUPABASE_URL: ✅ Set
   SUPABASE_SERVICE_ROLE_KEY: ✅ Set
✅ Server running successfully!
```

## 🎯 Expected URLs After Success

| Service | URL | Status Check |
|---------|-----|--------------|
| Frontend | http://localhost:5173 | Should load the login page |
| Backend API | http://localhost:3001 | Not directly accessible |
| Health Check | http://localhost:3001/api/health | Should return JSON |

## 🔍 Quick Troubleshooting Commands

```bash
# 1. Check setup
npm run check-setup

# 2. Test server connectivity
npm run test-server

# 3. Check if port is in use
lsof -i :3001

# 4. Check Node.js version (should be 18+)
node --version

# 5. Check npm version
npm --version

# 6. Reinstall dependencies if needed
rm -rf node_modules package-lock.json && npm install
```

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ `npm run test-server` shows success
2. ✅ Frontend loads at http://localhost:5173
3. ✅ Login form appears without "Failed to fetch" errors
4. ✅ You can attempt to sign in (even with wrong credentials)

## 🆘 Still Having Issues?

If you're still getting "Failed to fetch" errors after following all steps:

1. **Share the output of:**
   ```bash
   npm run check-setup
   npm run test-server
   lsof -i :3001
   ```

2. **Share the server logs** from the terminal running `npm run server:dev`

3. **Check the browser console** (F12) for additional error details

---

**🎯 The key point: The Node.js server on port 3001 MUST be running before the React frontend will work!**