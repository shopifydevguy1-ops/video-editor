# Railway Backend - Quick Start

## 🚀 5-Minute Setup

### 1. Create Project on Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select: `shopifydevguy1-ops/video-editor`
4. Click "Deploy Now"

### 2. Configure Service

1. Click on the service
2. **Settings** → **Root Directory**: `backend`
3. **Settings** → **Build Command**: `npm install && npm run build`
4. **Settings** → **Start Command**: `npm run start:prod`

### 3. Add Environment Variables

Go to **Variables** tab, add:

```env
DATABASE_URL=postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:5432/postgres
JWT_SECRET=change-this-to-a-random-secret-key
JWT_REFRESH_SECRET=change-this-to-another-random-secret-key
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=4000
```

### 4. Deploy & Get URL

1. Railway will auto-deploy
2. Go to **Settings** → **Networking**
3. Click **Generate Domain**
4. Copy URL: `https://your-app.up.railway.app`

### 5. Run Migrations

In Railway dashboard:
1. Go to **Deployments** → Latest deployment
2. Click **View Logs** → **Shell** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### 6. Update Vercel

1. Go to Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to:
   ```
   https://your-app.up.railway.app/api
   ```
3. Redeploy frontend

## ✅ Done!

Your backend is now live at: `https://your-app.up.railway.app/api`

## Test It

```bash
curl https://your-app.up.railway.app/api
```

For detailed instructions, see `RAILWAY_BACKEND_SETUP.md`

