# Vercel Environment Variables Setup

## Error Fix

The error "Environment Variable 'NEXT_PUBLIC_API_URL' references Secret 'api_url', which does not exist" occurs because the `vercel.json` was referencing a secret that doesn't exist.

## Solution

1. **Remove the secret reference** - I've updated `vercel.json` to remove the secret reference
2. **Add environment variable in Vercel dashboard**:

### Steps to Add Environment Variable:

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Go to **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.railway.app/api` or `http://localhost:4000/api` for development)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

## For Manual Deployment

When creating a deployment manually:
- **Commit or Branch Reference**: Use just `main` or a commit hash like `2f99c80`
- **NOT** a full GitHub URL

## After Adding Environment Variable

1. Redeploy your project
2. The build should complete successfully

## Example Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

Make sure to replace `your-backend-url.com` with your actual backend deployment URL.

