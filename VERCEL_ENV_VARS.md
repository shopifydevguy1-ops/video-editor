# Vercel Environment Variables

## Required Environment Variable

### `NEXT_PUBLIC_API_URL`

**Required:** Yes  
**Type:** String  
**Description:** The base URL of your backend API

**Example Values:**

For local development:
```
http://localhost:4000/api
```

For production (after backend is deployed):
```
https://your-backend.railway.app/api
```
or
```
https://your-backend.render.com/api
```

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Go to **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend API URL (see examples above)
   - **Environment**: Select all three:
     - ☑ Production
     - ☑ Preview  
     - ☑ Development
6. Click **Save**

## Important Notes

1. **`NEXT_PUBLIC_` prefix is required** - This tells Next.js to expose this variable to the browser
2. **Must include `/api` at the end** - Your backend API is served at `/api` route
3. **Update after backend deployment** - Start with `http://localhost:4000/api` for testing, then update to your production backend URL
4. **Redeploy after changes** - After updating the environment variable, you need to redeploy for changes to take effect

## Example Configuration

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

## Testing

After deployment, you can verify the environment variable is set correctly by:
1. Opening browser console on your deployed site
2. Running: `console.log(process.env.NEXT_PUBLIC_API_URL)`
3. It should show your backend URL

## No Other Variables Needed

For the frontend deployment on Vercel, **only `NEXT_PUBLIC_API_URL` is required**. All other environment variables (database, JWT secrets, etc.) are for the backend deployment only.

