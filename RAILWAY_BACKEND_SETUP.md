# Railway Backend Deployment Guide

## Step-by-Step Setup

### 1. Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub (recommended)

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub repositories
4. Select repository: `shopifydevguy1-ops/video-editor`
5. Click "Deploy Now"

### 3. Configure Backend Service

After the project is created:

1. Railway will detect the project structure
2. Click on the service that was created
3. Go to **Settings** tab

### 4. Set Root Directory

1. In Settings, find **Root Directory**
2. Set it to: `backend`
3. Click "Save"

### 5. Configure Build Settings

In the Settings tab:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**OR** if the above doesn't work, use:
```bash
node dist/main.js
```

### 6. Add Environment Variables

Go to **Variables** tab and add these:

#### Required Variables:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

```env
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

```env
PORT=4000
```

#### Optional Variables (add as needed):

```env
NODE_ENV=production
```

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

```env
ELEVENLABS_API_KEY=your-elevenlabs-key
OPENAI_API_KEY=your-openai-key
PEXELS_API_KEY=your-pexels-key
```

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 7. Run Database Migrations

After the service is deployed:

1. Go to your service
2. Click on **Deployments** tab
3. Click on the latest deployment
4. Click **View Logs**
5. Open the **Shell** tab (or use Railway CLI)

Run migrations:
```bash
npx prisma migrate deploy
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 8. Get Your Backend URL

1. Go to your service
2. Click **Settings** tab
3. Scroll to **Networking**
4. Click **Generate Domain**
5. Copy the generated URL (e.g., `your-app.up.railway.app`)

Your API will be available at:
```
https://your-app.up.railway.app/api
```

### 9. Update Vercel Environment Variable

1. Go to your Vercel project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to:
   ```
   https://your-app.up.railway.app/api
   ```
4. Redeploy frontend

### 10. Test Your Backend

Test the health endpoint:
```bash
curl https://your-app.up.railway.app/api
```

Or visit in browser:
```
https://your-app.up.railway.app/api
```

## Railway CLI (Alternative Method)

### Install Railway CLI

```bash
npm i -g @railway/cli
```

### Login

```bash
railway login
```

### Link Project

```bash
cd backend
railway link
```

### Set Environment Variables

```bash
railway variables set DATABASE_URL="postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:5432/postgres"
railway variables set JWT_SECRET="your-secret"
railway variables set JWT_REFRESH_SECRET="your-refresh-secret"
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

### Deploy

```bash
railway up
```

## Troubleshooting

### Build Fails

- Check build logs in Railway dashboard
- Ensure `backend/package.json` has correct build scripts
- Verify all dependencies are listed

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Check Supabase database is accessible
- Ensure migrations have run

### Service Won't Start

- Check start command is correct
- Verify `dist/main.js` exists after build
- Check logs for errors

### CORS Errors

- Ensure `FRONTEND_URL` is set correctly
- Check backend CORS configuration allows your Vercel domain

## Quick Checklist

- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] Root directory set to `backend`
- [ ] Build command configured
- [ ] Start command configured
- [ ] `DATABASE_URL` environment variable added
- [ ] `JWT_SECRET` environment variable added
- [ ] `JWT_REFRESH_SECRET` environment variable added
- [ ] `FRONTEND_URL` environment variable added
- [ ] Service deployed successfully
- [ ] Database migrations run
- [ ] Backend URL obtained
- [ ] Vercel `NEXT_PUBLIC_API_URL` updated
- [ ] Backend tested and working

## Environment Variables Summary

**Minimum Required:**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=4000
```

## Next Steps

After backend is deployed:
1. Update Vercel `NEXT_PUBLIC_API_URL` with Railway URL
2. Test full application flow
3. Create admin account if needed
4. Monitor logs for any issues

