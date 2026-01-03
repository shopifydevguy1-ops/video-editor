# Deployment Checklist

## ✅ Pre-Deployment

### Frontend (Vercel)
- [x] Vercel configuration files created
- [x] Environment variables documented
- [x] Build configuration verified
- [x] All dependencies installed

### Backend (Railway/Render)
- [x] Environment variables template created
- [x] Database schema ready
- [x] Migration scripts ready
- [x] Admin creation script ready

## 🚀 Deployment Steps

### 1. Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub: `shopifydevguy1-ops/video-editor`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = Your backend URL (set after backend deployment)
6. Click "Deploy"

### 2. Deploy Backend to Railway/Render

#### Option A: Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Add services:
   - **PostgreSQL** (add service)
   - **Redis** (add service, optional)
5. Set root directory to `backend`
6. Add all environment variables from `backend/env.example`
7. Set `FRONTEND_URL` to your Vercel URL
8. Deploy

#### Option B: Render
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repository
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
5. Add PostgreSQL database
6. Add all environment variables
7. Deploy

### 3. Run Database Migrations

```bash
# Get database URL from Railway/Render
# Then run:
cd backend
npx prisma migrate deploy
```

### 4. Seed Templates (Optional)

```bash
# Connect to production database
psql $DATABASE_URL -f backend/prisma/migrations/seed-templates.sql
```

### 5. Create Admin Account

```bash
cd backend
npm run create-admin
# Or use production database URL:
DATABASE_URL="your-prod-url" npm run create-admin
```

### 6. Update Frontend Environment

1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your backend URL
4. Redeploy frontend

## 🔧 Post-Deployment

### Verify
- [ ] Frontend loads at Vercel URL
- [ ] Backend health check works: `https://your-backend.com/api/health`
- [ ] Can register/login
- [ ] Can create projects
- [ ] Can generate videos
- [ ] Can export videos

### Monitor
- [ ] Check Vercel logs for frontend errors
- [ ] Check Railway/Render logs for backend errors
- [ ] Monitor database connections
- [ ] Check Redis connection (if used)

## 📝 Environment Variables Reference

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Backend (Railway/Render)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
REDIS_HOST=...
REDIS_PORT=6379
FRONTEND_URL=https://your-app.vercel.app
ELEVENLABS_API_KEY=...
OPENAI_API_KEY=...
PEXELS_API_KEY=...
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

## 🎉 Success!

Once deployed, your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app/api`

