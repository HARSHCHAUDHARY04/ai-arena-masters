@echo off
REM Quick setup script for MongoDB-based AI Arena Masters (Windows)

echo.
echo 🚀 AI Arena Masters - MongoDB Setup
echo ====================================
echo.

REM Check if npm exists
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Setup server
echo.
echo 🔧 Setting up server...
cd server
call npm install

REM Copy .env.example to .env if not exists
if not exist .env (
    copy .env.example .env
    echo ✓ Created server\.env (edit with your MongoDB URI)
)

REM Seed database
echo.
echo 🌱 Seeding database...
call npm run seed

REM Go back to root
cd ..

REM Setup frontend
echo.
echo 🎨 Setting up frontend...
call npm install

echo.
echo ✅ Setup complete!
echo.
echo To start the application:
echo   1. Terminal 1 (Backend): cd server ^&^& npm run dev
echo   2. Terminal 2 (Frontend): npm run dev
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:4000
echo.
echo Login with:
echo   Email: admin@example.com
echo   Password: admin123
echo.
pause
