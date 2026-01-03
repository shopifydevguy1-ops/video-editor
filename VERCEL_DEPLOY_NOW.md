# Deploy to Vercel - Step by Step

## ✅ Code is Ready

All code has been pushed to GitHub and is ready for deployment.

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select repository: `shopifydevguy1-ops/video-editor`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `cd ../shared && npm install && npm run build && cd ../frontend && npm install && npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: Your backend URL (e.g., `https://your-backend.railway.app/api` or `http://localhost:4000/api` for now)
     - **Environment**: All (Production, Preview, Development)
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? video-editor (or your choice)
# - Directory? ./
# - Override settings? No
```

## Important Notes

### Environment Variable

You **MUST** add `NEXT_PUBLIC_API_URL` before deploying:
- For now, you can use: `http://localhost:4000/api` (for testing)
- Later, update to your production backend URL

### Build Configuration

The `vercel.json` is configured, but you may need to set these in Vercel dashboard:
- **Root Directory**: `frontend`
- **Build Command**: `cd ../shared && npm install && npm run build && cd ../frontend && npm install && npm run build`

### After Deployment

1. Your app will be live at: `https://your-project.vercel.app`
2. Update `NEXT_PUBLIC_API_URL` to your production backend URL
3. Redeploy to apply changes

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure shared package builds first
- Verify all dependencies are in package.json

**Can't connect to backend?**
- Make sure backend is deployed and running
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly

## Next Steps After Deployment

1. Deploy backend to Railway/Render
2. Update `NEXT_PUBLIC_API_URL` in Vercel with production backend URL
3. Test the full application

