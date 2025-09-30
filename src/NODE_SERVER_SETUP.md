# Node.js Server Setup Guide

## Overview

Your GEMSTONE Fine Jewelry CRM has been successfully converted from Deno-based Supabase Edge Functions to a Node.js-compatible server using Hono web framework.

## What Was Converted

### Key Changes Made:
- ✅ **Import statements**: Changed from `jsr:@supabase/supabase-js@2.49.8` and `npm:hono` (Deno) to standard npm imports
- ✅ **Environment variables**: Changed from `Deno.env.get()` to `process.env` with Node.js imports
- ✅ **Server runtime**: Changed from `Deno.serve()` to Hono with Node.js adapter
- ✅ **ES Modules**: Proper Node.js ES module support

### Files Modified:
- `/supabase/functions/server/kv_store.tsx` - Updated to use Node.js environment variables
- `/supabase/functions/server/index.tsx` - Converted all Deno imports and environment access
- `/package.json` - Added Hono and Node.js server dependencies
- `/server.js` - New Node.js server runner
- `/.env.example` - Environment variable template

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual Supabase values:

```env
# Required - Get these from your Supabase dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server settings
PORT=3001
NODE_ENV=development
```

> **Where to find Supabase credentials:**
> 1. Go to your Supabase dashboard
> 2. Select your project
> 3. Go to Settings → API
> 4. Copy the URL, anon key, and service_role key

### 3. Start the Server

**Development Mode** (with auto-restart):
```bash
npm run server:dev
```

**Production Mode**:
```bash
npm run server
```

The server will start on `http://localhost:3001` (or your configured PORT).

### 4. Update Frontend Configuration

Update your frontend API calls to point to the Node.js server. In your React app, find where API calls are made and update the base URL:

```typescript
// Update your API base URL from Supabase Edge Functions to local server
const API_BASE = 'http://localhost:3001/make-server-2ed58025';
```

## Available API Endpoints

All endpoints are prefixed with `/make-server-2ed58025`:

### Database Management
- `GET /setup-database` - Check database status
- `POST /setup-database` - Create database tables

### Authentication
- `POST /signup` - User registration
- `POST /signin` - User login
- `POST /forgot-password` - Password reset
- `GET /profile` - Get user profile

### CRM Features
- `GET /leads` - Get all leads
- `POST /leads` - Create new lead
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead

- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

- `GET /dealers` - Get all dealers
- `POST /dealers` - Create new dealer
- `PUT /dealers/:id` - Update dealer
- `DELETE /dealers/:id` - Delete dealer

### Health Check
- `GET /health` - Server health status

## Key Benefits of Node.js Version

1. **Local Development**: Run and debug locally without Supabase Edge Functions
2. **Faster Iteration**: No deployment needed for server changes during development
3. **Standard Tooling**: Use familiar Node.js debugging and monitoring tools
4. **Flexible Deployment**: Deploy to any Node.js hosting platform
5. **Cost Effective**: Avoid Edge Function execution costs during development

## Testing the Conversion

1. Start the server: `npm run server:dev`
2. Check health endpoint: `curl http://localhost:3001/make-server-2ed58025/health`
3. Test database setup: `curl -X POST http://localhost:3001/make-server-2ed58025/setup-database`

Expected health response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Frontend Integration

To use the Node.js server with your React frontend, update the API configuration:

```typescript
// In your API utility files, change from:
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025`;

// To:
const API_BASE = 'http://localhost:3001/make-server-2ed58025';
```

## Production Deployment Options

The Node.js server can be deployed to various platforms:

### Vercel
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### Railway
Simply connect your GitHub repo and Railway will auto-detect the Node.js app.

### Heroku
Add a `Procfile`:
```
web: node server.js
```

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```
   Error: listen EADDRINUSE: address already in use :::3001
   ```
   **Solution**: Change the PORT in your `.env` file or kill the process using the port.

2. **Missing Environment Variables**
   ```
   TypeError: Cannot read properties of undefined
   ```
   **Solution**: Ensure all required environment variables are set in your `.env` file.

3. **Database Connection Issues**
   ```
   Error: Failed to fetch
   ```
   **Solution**: Verify your Supabase URL and service role key are correct.

4. **Import Errors**
   ```
   Error: Cannot resolve module
   ```
   **Solution**: Run `npm install` to ensure all dependencies are installed.

### Debug Mode

Set `NODE_ENV=development` in your `.env` file for detailed logging.

### Logs

The server includes comprehensive logging:
- 🔐 Authentication attempts
- 📥 API endpoint hits
- ❌ Error details
- ✅ Successful operations

## Support

The converted Node.js server maintains 100% API compatibility with the original Deno version while providing better local development experience. All your existing CRM features, authentication, and database operations work exactly the same way.

For additional help:
1. Check the server logs for detailed error messages
2. Verify all environment variables are configured
3. Ensure your Supabase project is accessible
4. Test with the health endpoint first