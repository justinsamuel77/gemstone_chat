# 🔧 Troubleshooting Guide

## Common Error: "Failed to fetch" / "Cannot connect to local server"

This error occurs when the frontend cannot connect to the local Node.js server. Here's how to fix it:

### Step 1: Check Setup
```bash
npm run check-setup
```
This will verify your environment configuration and dependencies.

### Step 2: Ensure Environment Variables Are Set

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your Supabase credentials:**
   ```env
   # Get these from your Supabase dashboard → Settings → API
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the Server

**Option A: Start both servers at once (Recommended)**
```bash
npm run start:all
```

**Option B: Start servers separately**
```bash
# Terminal 1 - Backend Server
npm run server:dev

# Terminal 2 - Frontend Server  
npm run dev
```

### Step 5: Verify Server is Running

1. **Check if the server is listening:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   
   Expected response:
   ```json
   {"status":"ok","timestamp":"2024-01-20T10:30:00.000Z","version":"1.0.0"}
   ```

2. **Check server logs** - You should see:
   ```
   🚀 Starting GEMSTONE CRM Server on port 3001
   ✅ Port 3001 is available
   ✅ Server running successfully!
   🌐 Health check: http://localhost:3001/api/health
   ```

## Common Issues and Solutions

### Issue 1: Port 3001 Already in Use

**Error:**
```
❌ Failed to start server on port 3001:
   Port 3001 is already in use
```

**Solutions:**
```bash
# Option 1: Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Option 2: Use a different port
PORT=3002 npm run server:dev

# Option 3: Check what's using the port
lsof -i :3001
```

### Issue 2: Missing Environment Variables

**Error:**
```
❌ Missing required environment variables:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
```

**Solution:**
1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the values to your `.env` file:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Issue 3: Dependencies Not Installed

**Error:**
```
Error: Cannot find module 'hono'
```

**Solution:**
```bash
npm install
```

### Issue 4: TypeScript Compilation Errors

**Error:**
```
Type errors during compilation
```

**Solution:**
```bash
# Check for type errors
npm run type-check

# Fix common issues
npm run lint
```

### Issue 5: Frontend Still Shows "Failed to fetch"

After starting the server successfully, if you still get fetch errors:

1. **Clear browser cache and reload**
2. **Check browser console** for detailed error messages
3. **Verify the frontend is calling the correct URLs:**
   - Development: `http://localhost:3001/api/*`
   - Production: `https://your-project.supabase.co/functions/v1/make-server-2ed58025/*`

4. **Check network tab** in browser developer tools to see actual requests

## Quick Diagnostic Commands

```bash
# 1. Check server health
curl http://localhost:3001/api/health

# 2. Check if port is open
telnet localhost 3001

# 3. Check server processes
ps aux | grep node

# 4. Check port usage
lsof -i :3001

# 5. Test Supabase connection
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Supabase client created successfully');
"
```

## Environment-Specific Solutions

### Windows Users

1. **Use the Windows batch file:**
   ```cmd
   .\start.bat
   ```

2. **Port killing on Windows:**
   ```cmd
   netstat -ano | findstr :3001
   taskkill /PID <PID_NUMBER> /F
   ```

### macOS/Linux Users

1. **Use the shell script:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

2. **Port management:**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

## Advanced Debugging

### Enable Detailed Logging

Add to your `.env`:
```env
DEBUG=*
LOG_LEVEL=debug
```

### Check Database Connection

Visit the "Server Diagnostics" page in the application or test manually:
```bash
curl -X POST http://localhost:3001/api/setup-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Authentication Flow

1. **Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test Signup:**
   ```bash
   curl -X POST http://localhost:3001/api/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123","firstName":"Test","lastName":"User"}'
   ```

## Getting Additional Help

If none of these solutions work:

1. **Check the server logs** in the terminal where `npm run server:dev` is running
2. **Check browser console** for frontend errors
3. **Verify all files are present** using the file structure in README.md
4. **Try a fresh installation:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Create a minimal test:**
   ```bash
   # Test if basic Node.js server works
   node -e "
   import { createServer } from 'http';
   const server = createServer((req, res) => {
     res.writeHead(200, { 'Content-Type': 'application/json' });
     res.end(JSON.stringify({ status: 'ok' }));
   });
   server.listen(3001, () => console.log('Test server running on 3001'));
   "
   ```

The key is to start with the basics: ensure the server is running, environment variables are set, and the health endpoint responds successfully.