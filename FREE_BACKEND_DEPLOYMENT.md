# Free Backend Deployment Alternatives

Since Railway's free plan has expired, here are the best **free alternatives** for deploying your NestJS backend:

## 🎯 Recommended: Render (Best Free Option)

### Why Render?
- ✅ **Free tier** with 750 hours/month (enough for 24/7)
- ✅ Automatic deployments from GitHub
- ✅ PostgreSQL database included (free tier)
- ✅ Easy environment variable management
- ✅ Automatic SSL certificates
- ✅ Similar to Railway in ease of use

### Setup Steps:

1. **Sign up**: https://render.com (use GitHub to sign in)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `shopifydevguy1-ops/video-editor`
   - Select the repository

3. **Configure Service**:
   - **Name**: `ai-video-editor-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: **Free** (select this!)

4. **Add Environment Variables**:
   Click "Environment" tab and add:
   ```
   DATABASE_URL=postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:5432/postgres
   JWT_SECRET=your-random-secret-key-here
   JWT_REFRESH_SECRET=your-random-refresh-secret-here
   FRONTEND_URL=https://your-vercel-app.vercel.app
   PORT=4000
   NODE_ENV=production
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Your backend will be at: `https://your-service-name.onrender.com`

6. **Update Vercel**:
   - Go to Vercel → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to: `https://your-service-name.onrender.com/api`

### Render Free Tier Limits:
- 750 hours/month (enough for 24/7)
- Service spins down after 15 minutes of inactivity (first request takes ~30s to wake up)
- 512MB RAM
- Free PostgreSQL database (90 days retention)

---

## 🚀 Alternative: Fly.io (Always Free)

### Why Fly.io?
- ✅ **Always free** (no time limits)
- ✅ No spin-down (always running)
- ✅ Global edge network
- ✅ More generous free tier

### Setup Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up**: https://fly.io (free account)

3. **Login**:
   ```bash
   fly auth login
   ```

4. **Initialize** (from backend directory):
   ```bash
   cd backend
   fly launch
   ```
   - Follow prompts
   - Don't create Postgres (you're using Supabase)
   - Don't deploy yet

5. **Create `fly.toml`** in `backend/`:
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 4000
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 1

   [[services]]
     http_checks = []
     internal_port = 4000
     processes = ["app"]
     protocol = "tcp"
     script_checks = []

     [services.concurrency]
       hard_limit = 25
       soft_limit = 20
       type = "connections"

     [[services.ports]]
       force_https = true
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443

     [[services.tcp_checks]]
       grace_period = "1s"
       interval = "15s"
       restart_limit = 0
       timeout = "2s"
   ```

6. **Set Secrets**:
   ```bash
   fly secrets set DATABASE_URL="postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:5432/postgres"
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set JWT_REFRESH_SECRET="your-refresh-secret"
   fly secrets set FRONTEND_URL="https://your-vercel-app.vercel.app"
   fly secrets set NODE_ENV="production"
   ```

7. **Deploy**:
   ```bash
   fly deploy
   ```

8. **Get URL**:
   Your app will be at: `https://your-app-name.fly.dev`

### Fly.io Free Tier:
- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB persistent volume storage
- 160GB outbound data transfer
- Always running (no spin-down)

---

## 🌐 Alternative: Cyclic.sh (Simplest)

### Why Cyclic?
- ✅ **Completely free** (no credit card)
- ✅ Automatic deployments
- ✅ Built-in database (optional)
- ✅ Very simple setup

### Setup Steps:

1. **Sign up**: https://cyclic.sh (GitHub OAuth)

2. **Create App**:
   - Click "Create App"
   - Select your repository: `shopifydevguy1-ops/video-editor`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`

3. **Add Environment Variables**:
   - Go to "Environment" tab
   - Add all required variables

4. **Deploy**:
   - Click "Deploy"
   - Your app: `https://your-app-name.cyclic.app`

---

## 📊 Comparison Table

| Platform | Free Tier | Spin-down | Database | Ease of Use |
|----------|-----------|-----------|----------|-------------|
| **Render** | 750 hrs/month | Yes (15 min) | Included | ⭐⭐⭐⭐⭐ |
| **Fly.io** | Always free | No | Separate | ⭐⭐⭐⭐ |
| **Cyclic** | Always free | No | Included | ⭐⭐⭐⭐⭐ |
| **Railway** | Expired | No | Included | ⭐⭐⭐⭐⭐ |

---

## 🎯 My Recommendation: **Render**

**Best for you because:**
1. Easiest setup (similar to Railway)
2. Free tier is generous (750 hours = 24/7 for most of the month)
3. Automatic deployments
4. Built-in PostgreSQL (though you're using Supabase)
5. Great documentation

**Note about spin-down**: Render free tier spins down after 15 minutes of inactivity. First request takes ~30 seconds to wake up. For production, consider upgrading to paid ($7/month) or use Fly.io for always-on.

---

## Quick Setup Commands

### For Render:
Just use the web interface - no CLI needed!

### For Fly.io:
```bash
# Install CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
cd backend
fly launch
fly secrets set DATABASE_URL="your-db-url"
fly deploy
```

### For Cyclic:
Just use the web interface!

---

## After Deployment

1. **Get your backend URL** (e.g., `https://your-app.onrender.com`)
2. **Update Vercel environment variable**:
   - `NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api`
3. **Redeploy Vercel** to apply changes
4. **Test your full stack!**

---

## Need Help?

If you encounter issues with any platform, let me know and I can help troubleshoot!

