@echo off
cls
echo ==================================
echo 🚀 GEMSTONE Fine Jewelry CRM
echo ==================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy .env.example .env >nul
    echo ✅ Please edit .env with your Supabase credentials before continuing.
    echo    Required: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
    echo.
    echo 📖 See README.md for detailed setup instructions.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

REM Run setup verification
echo 🔍 Checking setup...
call npm run check-setup

REM Check if port 3001 is available
netstat -an | find "3001" | find "LISTENING" >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 3001 is already in use!
    echo    Options:
    echo    1. Kill the process using port 3001
    echo    2. Use a different port: set PORT=3002 ^&^& start.bat
    echo    3. Check what's using it: netstat -ano ^| findstr :3001
    echo.
    set /p "choice=   Kill the process on port 3001? (y/N): "
    if /i "!choice!" == "y" (
        echo 🔥 Attempting to kill process on port 3001...
        for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3001') do taskkill /PID %%i /F >nul 2>&1
        timeout /t 2 >nul
    ) else (
        echo ❌ Cannot start - port 3001 is in use
        pause
        exit /b 1
    )
)

echo.
echo 🎯 Starting development servers...
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend will be available at: http://localhost:3001
echo 🏥 Health check: http://localhost:3001/api/health
echo.
echo 🔍 If you get 'Failed to fetch' errors:
echo    1. Check the troubleshooting guide: type TROUBLESHOOTING.md
echo    2. Verify both servers started successfully
echo    3. Test health endpoint in browser: http://localhost:3001/api/health
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers concurrently
call npm run start:all