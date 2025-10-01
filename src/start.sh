#!/bin/bash

clear
echo "=================================="
echo "🚀 GEMSTONE Fine Jewelry CRM"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env with your Supabase credentials before continuing."
    echo "   Required: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "📖 See README.md for detailed setup instructions."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run setup verification
echo "🔍 Checking setup..."
npm run check-setup

# Check if port 3001 is available
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3001 is already in use!"
    echo "   Options:"
    echo "   1. Kill the process: lsof -ti:3001 | xargs kill -9"
    echo "   2. Use a different port: PORT=3002 ./start.sh"
    echo "   3. Check what's using it: lsof -i :3001"
    echo ""
    read -p "   Kill the process on port 3001? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔥 Killing process on port 3001..."
        lsof -ti:3001 | xargs kill -9 2>/dev/null
        sleep 2
    else
        echo "❌ Cannot start - port 3001 is in use"
        exit 1
    fi
fi

echo ""
echo "🎯 Starting development servers..."
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/api/health"
echo ""
echo "🔍 If you get 'Failed to fetch' errors:"
echo "   1. Check the troubleshooting guide: cat TROUBLESHOOTING.md"
echo "   2. Verify both servers started successfully"
echo "   3. Test health endpoint: curl http://localhost:3001/api/health"
echo ""  
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
npm run start:all