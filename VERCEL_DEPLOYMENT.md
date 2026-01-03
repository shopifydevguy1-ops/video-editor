# Vercel Deployment Guide

## Frontend Deployment (Vercel)

### Automatic Deployment

1. **Connect Repository to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository: `shopifydevguy1-ops/video-editor`
   - Vercel will auto-detect Next.js

2. **Configure Build Settings:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Environment Variables:**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

### Manual Deployment

```bash
cd frontend
npm install
npm run build
vercel --prod
```

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables from `backend/env.example`
6. Railway auto-detects NestJS

### Option 2: Render
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
5. Add environment variables

### Option 3: Fly.io
```bash
cd backend
fly launch
fly deploy
```

## Environment Variables Checklist

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Your backend API URL

### Backend (Railway/Render)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret string
- `JWT_REFRESH_SECRET` - Random secret string
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `FRONTEND_URL` - Your Vercel frontend URL
- `ELEVENLABS_API_KEY` - (Optional)
- `OPENAI_API_KEY` - (Optional)
- `PEXELS_API_KEY` - (Optional)
- Storage credentials (S3/R2)

## Database Setup

### Production Database
Use managed PostgreSQL:
- **Railway**: Add PostgreSQL service
- **Render**: Add PostgreSQL database
- **Supabase**: Free tier available
- **Neon**: Serverless PostgreSQL

### Run Migrations
```bash
cd backend
npx prisma migrate deploy
```

## Redis Setup

### Production Redis
- **Railway**: Add Redis service
- **Render**: Add Redis instance
- **Upstash**: Serverless Redis (free tier)

## Post-Deployment

1. **Update CORS** in backend to allow Vercel domain
2. **Update Frontend URL** in backend env vars
3. **Test API** endpoints
4. **Create admin account** using the script

## Vercel Configuration Files

- `vercel.json` - Root configuration
- `frontend/vercel.json` - Frontend-specific config
- `.vercelignore` - Files to exclude

## Troubleshooting

**Build fails:**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check build logs in Vercel

**API not connecting:**
- Verify `NEXT_PUBLIC_API_URL` is set
- Check CORS settings in backend
- Verify backend is deployed and running

**Database errors:**
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible from backend

