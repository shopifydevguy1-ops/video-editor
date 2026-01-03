# Railway Build Failure - Troubleshooting Guide

## Common Issues & Fixes

### Issue 1: Missing Build Script or Wrong Commands

**Check Railway Settings:**
- **Root Directory**: Must be `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### Issue 2: Prisma Client Not Generated

**Solution:** Add to build command:
```bash
npm install && npx prisma generate && npm run build
```

### Issue 3: Shared Package Not Found

**Solution:** The build needs to install shared package first. Update build command:
```bash
cd .. && npm install && cd backend && npm install && npm run build
```

### Issue 4: TypeScript Errors

**Check build logs** for specific TypeScript errors and fix them.

### Issue 5: Missing Dependencies

**Solution:** Ensure all dependencies are in `package.json`, not just `devDependencies`.

## Step-by-Step Fix

### 1. Check Build Logs

1. Go to Railway dashboard
2. Click on your backend service
3. Go to **Deployments** tab
4. Click on the failed deployment
5. Click **View Logs**
6. Look for error messages

### 2. Common Build Command Fixes

Try these build commands in order:

**Option A (Standard):**
```bash
npm install && npm run build
```

**Option B (With Prisma):**
```bash
npm install && npx prisma generate && npm run build
```

**Option C (Monorepo - Full):**
```bash
cd .. && npm install && cd backend && npm install && npx prisma generate && npm run build
```

**Option D (Monorepo - Workspace):**
```bash
npm install --workspace=backend && cd backend && npx prisma generate && npm run build
```

### 3. Start Command

Use one of these:

**Option A:**
```bash
npm run start:prod
```

**Option B:**
```bash
node dist/main.js
```

**Option C:**
```bash
cd backend && node dist/main.js
```

### 4. Environment Variables Check

Ensure these are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `PORT` (optional, defaults to 4000)

### 5. Root Directory

**Critical:** Must be set to `backend` in Railway settings.

## Quick Fix Steps

1. **Go to Railway** → Your backend service → **Settings**
2. **Update Build Command** to:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
3. **Update Start Command** to:
   ```bash
   npm run start:prod
   ```
4. **Verify Root Directory** is: `backend`
5. **Redeploy** by pushing a new commit or clicking "Redeploy"

## If Still Failing

### Check Build Logs For:

1. **"Cannot find module '@ai-video-editor/shared'"**
   - Fix: Use monorepo build command (Option C above)

2. **"Prisma Client not generated"**
   - Fix: Add `npx prisma generate` to build command

3. **"Cannot find module 'bcrypt'"**
   - Fix: Ensure all native dependencies are in `dependencies`, not `devDependencies`

4. **"TypeScript errors"**
   - Fix: Check logs for specific errors and fix in code

5. **"Build script not found"**
   - Fix: Verify `package.json` has `"build": "nest build"` script

## Recommended Railway Configuration

**Root Directory:** `backend`

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Environment Variables:**
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `JWT_REFRESH_SECRET` (required)
- `FRONTEND_URL` (required)
- `PORT=4000` (optional)
- `NODE_ENV=production` (optional)

## Alternative: Use Railway CLI

If dashboard doesn't work, use CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
cd backend
railway link

# Set variables
railway variables set DATABASE_URL="your-db-url"
railway variables set JWT_SECRET="your-secret"
railway variables set JWT_REFRESH_SECRET="your-refresh-secret"
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"

# Deploy
railway up
```

## Need More Help?

Share the error message from Railway build logs, and I can provide a specific fix!

