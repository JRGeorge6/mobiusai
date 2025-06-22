@echo off
echo 🌐 Deploying StudyMentor to Render (FREE)...

REM Check if user has git repository
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check if user has remote repository
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ No remote repository found. Please add your GitHub repository:
    echo    git remote add origin https://github.com/yourusername/StudyMentor.git
    echo    git push -u origin main
    pause
    exit /b 1
)

echo ✅ Git repository ready!

echo.
echo 🚀 Render Deployment Instructions:
echo.
echo 1. Go to https://render.com
echo 2. Sign up with GitHub (NO CREDIT CARD REQUIRED)
echo 3. Click 'New +' → 'Web Service'
echo 4. Connect your GitHub repository
echo 5. Configure the service:
echo.
echo    Name: StudyMentor
echo    Environment: Node
echo    Build Command: npm install ^&^& npm run build
echo    Start Command: npm start
echo    Plan: Free
echo.
echo 6. Add PostgreSQL Database:
echo    - Click 'New +' → 'PostgreSQL'
echo    - Name: studymentor-db
echo    - Plan: Free
echo    - Copy the connection string
echo.
echo 7. Set Environment Variables in your Web Service:
echo    DATABASE_URL=postgresql://... (from step 6)
echo    NODE_ENV=production
echo    SESSION_SECRET=your-super-secret-session-key-min-32-chars
echo    COOKIE_SECRET=your-cookie-secret-min-32-chars
echo    OPENAI_API_KEY=your-openai-api-key
echo    CANVAS_CLIENT_ID=your-canvas-client-id (optional)
echo    CANVAS_CLIENT_SECRET=your-canvas-client-secret (optional)
echo    CANVAS_REDIRECT_URI=https://your-app.onrender.com/api/canvas/callback
echo    RATE_LIMIT_MAX_REQUESTS=100
echo    SENSITIVE_OPERATION_LIMIT=10
echo    OPENAI_REQUEST_LIMIT=50
echo    ALLOWED_ORIGINS=https://your-app.onrender.com
echo    LOG_LEVEL=info
echo    ENABLE_REQUEST_LOGGING=true
echo    ENABLE_DEBUG_MODE=false
echo    ENABLE_VERBOSE_LOGGING=false
echo.
echo 8. Click 'Create Web Service'
echo.
echo Your app will be deployed to: https://your-app-name.onrender.com
echo.
echo ✅ Render is completely FREE with no credit card required!
echo.

echo 📋 Next steps:
echo 1. Follow the instructions above
echo 2. Your app will be live in 5-10 minutes
echo 3. Check the logs in Render dashboard for any issues
echo 4. Run database migrations: npm run db:push (in Render shell)

pause 