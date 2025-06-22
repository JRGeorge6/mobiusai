# StudyMentor Deployment Guide

## Overview

StudyMentor is a full-stack application with:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: Session-based auth with multiple providers
- **Features**: AI-powered study assistant with Canvas integration

## Prerequisites

1. **Database**: PostgreSQL database (Neon recommended - FREE)
2. **Environment Variables**: All required secrets configured
3. **Domain**: Custom domain (optional but recommended for AdSense)

## Local Preparation (Before Deployment)

### 1. Test Your Build Locally

```bash
# Install dependencies
npm install

# Test the build process
npm run build

# Test production server locally
npm start
```

### 2. Verify Environment Variables

Create a `.env` file locally to test (don't commit this):

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
SESSION_SECRET=your-super-secret-session-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Canvas LMS (optional)
CANVAS_CLIENT_ID=your-canvas-client-id
CANVAS_CLIENT_SECRET=your-canvas-client-secret
CANVAS_REDIRECT_URI=http://localhost:3000/api/canvas/callback

# Server
NODE_ENV=development
BASE_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Push database schema (if using Drizzle)
npm run db:push
```

## Authentication Setup

### Available Authentication Methods:

1. **Demo Login** - Quick access for development/testing
2. **Local Authentication** - Email-based login with password
3. **OAuth Providers** - Google, GitHub (optional, requires API keys)

### Environment Variables for Authentication:

```bash
# Required
SESSION_SECRET=your-super-secret-session-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars

# Optional OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
BASE_URL=https://your-domain.com
```

## Deployment Options (All FREE)

### 🌐 **Option 1: Render (Recommended - Completely Free)**

Render provides free hosting with PostgreSQL support and no credit card required.

#### Setup Steps:

1. **Connect GitHub Repository**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (no credit card required)
   - Connect your GitHub account
   - Select your StudyMentor repository

2. **Create Web Service**:
   - **Name**: StudyMentor
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
   - **Region**: Choose closest to your users

3. **Add PostgreSQL Database**:
   - In Render dashboard, click "New" → "PostgreSQL"
   - **Name**: StudyMentor-DB
   - **Plan**: Free
   - **Region**: Same as web service
   - Copy the connection string

4. **Set Environment Variables**:
   In your web service settings, add these environment variables:
   ```
   DATABASE_URL=postgresql://... (from step 3)
   NODE_ENV=production
   SESSION_SECRET=your-super-secret-session-key-min-32-chars
   COOKIE_SECRET=your-cookie-secret-min-32-chars
   OPENAI_API_KEY=your-openai-api-key
   CANVAS_CLIENT_ID=your-canvas-client-id
   CANVAS_CLIENT_SECRET=your-canvas-client-secret
   CANVAS_REDIRECT_URI=https://your-app.onrender.com/api/canvas/callback
   BASE_URL=https://your-app.onrender.com
   ALLOWED_ORIGINS=https://your-app.onrender.com
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Your app will be available at `https://your-app.onrender.com`

### 🔥 **Option 2: Vercel + Neon (Completely Free)**

Vercel for frontend, Neon for database, separate backend deployment.

#### Setup Steps:

1. **Deploy Backend to Render** (follow Option 1 above)

2. **Set up Neon Database**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up (free tier)
   - Create new project
   - Copy connection string

3. **Deploy Frontend to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Configure Frontend Environment**:
   ```bash
   vercel env add VITE_API_URL https://your-backend-url.onrender.com
   ```

### 🐳 **Option 3: Docker + Free Platforms**

Create a Docker deployment for maximum flexibility.

#### Create Dockerfile:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000
CMD ["npm", "start"]
```

#### Free Docker Hosting Options:
- **Railway** (Free tier: $5/month credit)
- **Render** (Free tier)
- **Fly.io** (Free tier: 3 shared-cpu VMs)
- **Google Cloud Run** (Free tier: 2 million requests/month)

### 🚀 **Option 4: Railway (Free Tier Available)**

Railway offers a free tier with $5/month credit.

#### Setup Steps:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Add PostgreSQL Database**:
   ```bash
   railway add
   # Select PostgreSQL
   ```

5. **Set Environment Variables**:
   ```bash
   railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
   railway variables set NODE_ENV=production
   railway variables set SESSION_SECRET=your-super-secret-session-key-min-32-chars
   railway variables set COOKIE_SECRET=your-cookie-secret-min-32-chars
   railway variables set OPENAI_API_KEY=your-openai-api-key
   railway variables set CANVAS_CLIENT_ID=your-canvas-client-id
   railway variables set CANVAS_CLIENT_SECRET=your-canvas-client-secret
   railway variables set CANVAS_REDIRECT_URI=https://your-domain.railway.app/api/canvas/callback
   railway variables set BASE_URL=https://your-domain.railway.app
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

## Environment Variables Setup

### Required Variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
SESSION_SECRET=your-super-secret-session-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Canvas LMS (optional)
CANVAS_CLIENT_ID=your-canvas-client-id
CANVAS_CLIENT_SECRET=your-canvas-client-secret
CANVAS_REDIRECT_URI=https://your-domain.com/api/canvas/callback

# Server
NODE_ENV=production
BASE_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

### Optional Variables:

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_DEBUG_MODE=false

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Post-Deployment Steps

### 1. Database Migration

After deployment, run database migrations:

```bash
# If using Railway CLI
railway run npm run db:push

# If using Render, add this to your build command:
# npm install && npm run build && npm run db:push
```

### 2. Test Your Application

1. **Test Authentication**:
   - Try demo login
   - Test registration/login
   - Verify OAuth providers (if configured)

2. **Test Core Features**:
   - Dashboard loads
   - Navigation works
   - API endpoints respond

3. **Check Logs**:
   - Monitor application logs
   - Check for errors
   - Verify database connections

### 3. Custom Domain (Optional)

1. **Add Custom Domain** in your hosting platform
2. **Update Environment Variables**:
   ```
   BASE_URL=https://your-domain.com
   ALLOWED_ORIGINS=https://your-domain.com
   CANVAS_REDIRECT_URI=https://your-domain.com/api/canvas/callback
   ```

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Check database is accessible from your hosting platform
   - Ensure database schema is migrated

3. **Authentication Issues**:
   - Verify SESSION_SECRET and COOKIE_SECRET are set
   - Check CORS settings
   - Ensure BASE_URL matches your domain

4. **Static Files Not Loading**:
   - Verify build output directory matches server configuration
   - Check static file serving middleware
   - Ensure Vite build completed successfully

### Debug Mode:

Enable debug mode for troubleshooting:

```bash
ENABLE_DEBUG_MODE=true
LOG_LEVEL=debug
ENABLE_VERBOSE_LOGGING=true
```

## Security Checklist

- ✅ CSRF protection enabled
- ✅ Rate limiting configured
- ✅ Security headers set (Helmet)
- ✅ CORS properly configured
- ✅ Session secrets are strong and unique
- ✅ Environment variables are secure
- ✅ Database connection is encrypted
- ✅ HTTPS enabled (automatic on most platforms)

## Performance Optimization

- ✅ Static files are served efficiently
- ✅ Database queries are optimized
- ✅ Rate limiting prevents abuse
- ✅ Caching headers are set
- ✅ Build process is optimized

Your StudyMentor application is now ready for deployment! Choose your preferred platform and follow the steps above. 