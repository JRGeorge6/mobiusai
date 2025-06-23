#!/bin/bash

# MobiusAI Railway Deployment Script
echo "🚀 Deploying MobiusAI to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Initialize Railway project if not already done
if [ ! -f ".railway" ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "🔧 Setting environment variables..."

# Database URL (Railway will provide this)
railway variables set DATABASE_URL="$DATABASE_URL"

# Security
railway variables set NODE_ENV=production
railway variables set SESSION_SECRET="$SESSION_SECRET"
railway variables set COOKIE_SECRET="$COOKIE_SECRET"

# OpenAI
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"

# Canvas (optional)
if [ ! -z "$CANVAS_CLIENT_ID" ]; then
    railway variables set CANVAS_CLIENT_ID="$CANVAS_CLIENT_ID"
    railway variables set CANVAS_CLIENT_SECRET="$CANVAS_CLIENT_SECRET"
    railway variables set CANVAS_REDIRECT_URI="$CANVAS_REDIRECT_URI"
fi

# Rate limiting
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set SENSITIVE_OPERATION_LIMIT=10
railway variables set OPENAI_REQUEST_LIMIT=50

# CORS
railway variables set ALLOWED_ORIGINS="$ALLOWED_ORIGINS"

# Logging
railway variables set LOG_LEVEL=info
railway variables set ENABLE_REQUEST_LOGGING=true
railway variables set ENABLE_DEBUG_MODE=false
railway variables set ENABLE_VERBOSE_LOGGING=false

# Deploy
echo "🚀 Deploying to Railway..."
railway up

# Run database migrations
echo "🗄️ Running database migrations..."
railway run npm run db:push

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: $(railway domain)"

# Show logs
echo "📋 Recent logs:"
railway logs --tail 10 