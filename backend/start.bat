@echo off
chcp 65001 >nul
echo 🚀 Starting Finance Leads Backend...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Check for .env file
if not exist ".env" (
    echo ⚠️  .env file not found!
    if exist ".env.example" (
        echo 📄 Creating .env from .env.example...
        copy .env.example .env
        echo ✅ .env created. Please edit it before running again.
        echo.
        pause
        exit /b 1
    ) else (
        echo ❌ .env.example not found!
        pause
        exit /b 1
    )
)

REM Try to start MongoDB (Windows Service)
echo 🔍 Checking MongoDB...
net start MongoDB >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Could not start MongoDB service (may already be running or not installed)
    echo 💡 If MongoDB is not installed, either:
    echo    1. Install MongoDB Community Server
    echo    2. Use MongoDB Atlas (cloud) - update MONGODB_URI in .env
    echo.
)

echo 🌐 Starting server with nodemon...
echo 📍 API will be available at: http://localhost:5000/api
echo 🏥 Health check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop
echo.

npx nodemon src/server.js

if errorlevel 1 (
    echo.
    echo ❌ Server failed to start
    echo 💡 Check the error messages above
    pause
)
