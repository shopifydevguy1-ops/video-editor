# Render Deployment - Quick Start (Recommended)

## 🚀 5-Minute Setup

### Step 1: Sign Up
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign in with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect repository: `shopifydevguy1-ops/video-editor`
3. Click "Connect"

### Step 3: Configure
Fill in these settings:

**Basic Settings:**
- **Name**: `ai-video-editor-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start:prod`
- **Plan**: Select **Free**

### Step 4: Environment Variables
Click "Environment" and add:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
JWT_SECRET=change-this-to-a-random-secret-key
JWT_REFRESH_SECRET=change-this-to-another-random-secret-key
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=4000
NODE_ENV=production
```

**Note**: Replace `YOUR_PASSWORD` and `YOUR_PROJECT_REF` with your actual Supabase credentials. Get your connection string from Supabase Dashboard → Settings → Database.

**Important**: Generate strong random secrets for JWT keys!

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for build to complete (~5-10 minutes)
3. Your backend will be live at: `https://ai-video-editor-backend.onrender.com`

### Step 6: Run Migrations
After first deployment:
1. Go to your service → "Shell" tab
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Step 7: Update Vercel
1. Go to Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to:
   ```
   https://ai-video-editor-backend.onrender.com/api
   ```
3. Redeploy frontend

## ✅ Done!

Your backend is now live on Render!

## Important Notes

### Free Tier Limitations:
- **Spin-down**: Service sleeps after 15 minutes of inactivity
- **Wake time**: First request after sleep takes ~30 seconds
- **Solution**: For production, consider paid plan ($7/month) or use Fly.io

### To Keep Service Awake (Free Tier):
You can use a free service like:
- https://uptimerobot.com (free monitoring)
- https://cron-job.org (free cron jobs)
- Set up a simple ping every 10 minutes

## Troubleshooting

**Build fails?**
- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify build command is correct

**Service won't start?**
- Check logs in Render dashboard
- Verify start command: `npm run start:prod`
- Ensure PORT environment variable is set

**Database connection fails?**
- Verify DATABASE_URL is correct
- Check Supabase database is accessible
- Ensure migrations have run

