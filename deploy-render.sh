#!/bin/bash

# StudyMentor Render Deployment Script (Completely FREE)
echo "🌐 Deploying StudyMentor to Render (FREE)..."

# Check if user has git repository
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if user has remote repository
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No remote repository found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/StudyMentor.git"
    echo "   git push -u origin main"
    exit 1
fi

echo "✅ Git repository ready!"

echo "
🚀 Render Deployment Instructions:

1. Go to https://render.com
2. Sign up with GitHub (NO CREDIT CARD REQUIRED)
3. Click 'New +' → 'Web Service'
4. Connect your GitHub repository
5. Configure the service:

   Name: StudyMentor
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free

6. Add PostgreSQL Database:
   - Click 'New +' → 'PostgreSQL'
   - Name: studymentor-db
   - Plan: Free
   - Copy the connection string

7. Set Environment Variables in your Web Service:
   DATABASE_URL=postgresql://... (from step 6)
   NODE_ENV=production
   SESSION_SECRET=your-super-secret-session-key-min-32-chars
   COOKIE_SECRET=your-cookie-secret-min-32-chars
   OPENAI_API_KEY=your-openai-api-key
   CANVAS_CLIENT_ID=your-canvas-client-id (optional)
   CANVAS_CLIENT_SECRET=your-canvas-client-secret (optional)
   CANVAS_REDIRECT_URI=https://your-app.onrender.com/api/canvas/callback
   RATE_LIMIT_MAX_REQUESTS=100
   SENSITIVE_OPERATION_LIMIT=10
   OPENAI_REQUEST_LIMIT=50
   ALLOWED_ORIGINS=https://your-app.onrender.com
   LOG_LEVEL=info
   ENABLE_REQUEST_LOGGING=true
   ENABLE_DEBUG_MODE=false
   ENABLE_VERBOSE_LOGGING=false

8. Click 'Create Web Service'

Your app will be deployed to: https://your-app-name.onrender.com

✅ Render is completely FREE with no credit card required!
"

echo "📋 Next steps:"
echo "1. Follow the instructions above"
echo "2. Your app will be live in 5-10 minutes"
echo "3. Check the logs in Render dashboard for any issues"
echo "4. Run database migrations: npm run db:push (in Render shell)" 