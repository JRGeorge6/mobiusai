@echo off
echo 🚀 Deploying StudyMentor to Railway...

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