@echo off
echo 🚀 Deploying MobiusAI to Railway...
echo.
echo 📋 Prerequisites:
echo 1. Railway CLI installed (npm install -g @railway/cli)
echo 2. Railway account (free tier available)
echo 3. Git repository with code
echo.
echo 🚀 Deployment Steps:
echo.
echo 1. Install Railway CLI:
echo    npm install -g @railway/cli
echo.
echo 2. Login to Railway:
echo    railway login
echo.
echo 3. Initialize project:
echo    railway init
echo.
echo 4. Add PostgreSQL database:
echo    railway add
echo    # Select PostgreSQL
echo.
echo 5. Set environment variables:
echo    railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
echo    railway variables set NODE_ENV=production
echo    railway variables set SESSION_SECRET=your-super-secret-session-key-min-32-chars
echo    railway variables set COOKIE_SECRET=your-cookie-secret-min-32-chars
echo    railway variables set OPENAI_API_KEY=your-openai-api-key
echo    railway variables set CANVAS_CLIENT_ID=your-canvas-client-id (optional)
echo    railway variables set CANVAS_CLIENT_SECRET=your-canvas-client-secret (optional)
echo    railway variables set CANVAS_REDIRECT_URI=https://your-domain.railway.app/api/canvas/callback
echo    railway variables set BASE_URL=https://your-domain.railway.app
echo.
echo 6. Deploy:
echo    railway up
echo.
echo Your app will be deployed to: https://your-domain.railway.app
echo.
echo ✅ Railway offers a free tier with $5/month credit!
echo.
pause

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Check if user is logged in
railway whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please log in to Railway...
    railway login
)

REM Initialize Railway project if not already done
if not exist ".railway" (
    echo 📦 Initializing Railway project...
    railway init
)

echo 🔧 Setting environment variables...

REM Set environment variables
railway variables set NODE_ENV=production
railway variables set SESSION_SECRET=%SESSION_SECRET%
railway variables set COOKIE_SECRET=%COOKIE_SECRET%
railway variables set OPENAI_API_KEY=%OPENAI_API_KEY%
railway variables set DATABASE_URL=%DATABASE_URL%

REM Canvas (optional)
if not "%CANVAS_CLIENT_ID%"=="" (
    railway variables set CANVAS_CLIENT_ID=%CANVAS_CLIENT_ID%
    railway variables set CANVAS_CLIENT_SECRET=%CANVAS_CLIENT_SECRET%
    railway variables set CANVAS_REDIRECT_URI=%CANVAS_REDIRECT_URI%
)

REM Rate limiting
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set SENSITIVE_OPERATION_LIMIT=10
railway variables set OPENAI_REQUEST_LIMIT=50

REM CORS
railway variables set ALLOWED_ORIGINS=%ALLOWED_ORIGINS%

REM Logging
railway variables set LOG_LEVEL=info
railway variables set ENABLE_REQUEST_LOGGING=true
railway variables set ENABLE_DEBUG_MODE=false
railway variables set ENABLE_VERBOSE_LOGGING=false

REM Deploy
echo 🚀 Deploying to Railway...
railway up

REM Run database migrations
echo 🗄️ Running database migrations...
railway run npm run db:push

echo ✅ Deployment complete!
echo 🌐 Your app is now live at: 
railway domain

echo 📋 Recent logs:
railway logs --tail 10

pause 