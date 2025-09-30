# 🚀 Deployment Guide

This guide covers both local development and production deployment options for the GEMSTONE CRM system.

## 🏠 Local Development

For local development, use the Node.js server which is more convenient and has better debugging capabilities.

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase account and project

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start both frontend and backend
npm run start:all
```

### Environment Variables (.env)
```env
# Get these from your Supabase dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

PORT=3001
NODE_ENV=development
```

### Local Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## ☁️ Production Deployment

You have several deployment options for production:

### Option 1: Supabase Edge Functions (Recommended for Supabase users)

If you want to deploy the backend as a Supabase Edge Function:

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your_project_id
   ```

4. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy server
   ```

5. **Update frontend to use Edge Function**:
   The frontend will automatically use the Edge Function in production mode based on the `NODE_ENV` environment variable.

**Note**: The Edge Function uses JSR imports and Deno runtime, which is already configured in `/supabase/functions/server/index.tsx`.

### Option 2: Separate Frontend and Backend Deployment

#### Frontend Deployment (Vercel/Netlify)

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

**Netlify:**
```bash
# Build locally
npm run build

# Deploy dist/ folder to Netlify
```

#### Backend Deployment (Railway/Heroku)

**Railway:**
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

**Heroku:**
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Deploy
git push heroku main
```

### Option 3: Full-Stack Deployment (Vercel)

You can deploy both frontend and backend to Vercel:

1. **Create `vercel.json`**:
   ```json
   {
     "builds": [
       {
         "src": "server/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.js"
       },
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔄 API Configuration

The application automatically switches between local and production APIs based on the environment:

### Development (Local Node.js server)
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

### Production (Supabase Edge Function)
```typescript
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025`;
```

This is configured in:
- `/utils/supabase/client.tsx`
- `/utils/supabase/api.tsx`
- `/components/DatabaseSetup.tsx`

## 🗄️ Database Setup

### Supabase Database Configuration

1. **Automatic Setup** (Recommended):
   - Start the application
   - Go to "Server Diagnostics" in the dashboard
   - Click "Check Database Setup"
   - Click "Create Tables" if needed

2. **Manual Setup**:
   - Go to your Supabase dashboard → SQL Editor
   - Run the SQL from `/supabase/functions/server/database-setup.sql`

### Required Tables
- `leads` - Customer leads and prospects
- `orders` - Order management and tracking  
- `dealers` - Dealer and supplier information
- `auth.users` - User authentication (managed by Supabase)

## 🔐 Environment Variables for Production

### For Supabase Edge Functions
Set these in your Supabase dashboard → Edge Functions → Environment Variables:
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### For External Hosting (Railway, Heroku, etc.)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
PORT=3001
```

## 🔍 Troubleshooting Deployment

### Common Issues

**1. JSR Import Errors (Supabase Edge Functions)**
- ✅ **Fixed**: Edge function now uses `jsr:@supabase/supabase-js` and `npm:hono`
- ✅ **Fixed**: Uses `Deno.env.get()` instead of `process.env`

**2. API Endpoint Mismatch**
- Verify the `projectId` in `/utils/supabase/info.tsx` matches your Supabase project
- Check that environment variables are set correctly

**3. Database Connection Issues**
- Use the Database Setup component to verify and create tables
- Check Supabase project is active and accessible
- Verify service role key has proper permissions

**4. CORS Issues**
- Edge Function has CORS enabled for all origins
- For custom hosting, ensure CORS is configured properly

### Debug Commands

```bash
# Test local API
curl http://localhost:3001/api/health

# Test Edge Function (replace project_id)
curl https://your-project.supabase.co/functions/v1/make-server-2ed58025/health

# Check build
npm run build

# Type checking
npm run type-check
```

## 📈 Scaling Considerations

### Development Stage
- Use local Node.js server for development
- Supabase free tier for database and auth

### Production Stage
- Deploy Edge Function to Supabase for backend
- Deploy frontend to Vercel/Netlify
- Consider Supabase Pro plan for increased limits

### Enterprise Stage
- Consider dedicated hosting for backend
- Implement caching layers
- Set up monitoring and logging
- Database performance optimization

## 🔄 CI/CD Pipeline

For automated deployments, create GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run type-check
      # Add deployment steps for your chosen platform
```

---

Choose the deployment strategy that best fits your needs and infrastructure preferences. The local Node.js server is perfect for development, while Supabase Edge Functions provide seamless integration for production deployments.