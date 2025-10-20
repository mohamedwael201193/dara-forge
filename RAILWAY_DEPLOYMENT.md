# Railway Frontend Deployment Guide

## Overview

This guide explains how to deploy the DARA Forge **frontend** to Railway.app while keeping the API backend on Render.

## Architecture

- **Frontend (Railway)**: Static React app served via Vite preview server
- **Backend API (Render)**: Express.js server at `https://dara-api.onrender.com`

## Deployment Steps

### 1. Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select `mohamedwael201193/dara-forge`

### 2. Configure Environment Variables

Add these environment variables in Railway dashboard:

```bash
# API Backend URL (points to Render)
VITE_API_BASE_URL=https://dara-api.onrender.com

# Node environment
NODE_ENV=production

# Port (Railway will set this automatically, but we specify for clarity)
PORT=3000
```

### 3. Configure Build & Deploy Settings

Railway will automatically detect the `railway.json` file with these settings:

- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`
- **Builder**: NIXPACKS (automatic)

### 4. Domain Configuration

Railway will provide a domain like:

- `dara-forge-production.up.railway.app`

You can also add a custom domain in Railway settings.

### 5. Update CORS on Render API

After deploying to Railway, update the CORS configuration in `server.js`:

```javascript
const allowedOrigins = [
  "https://dara-forge.vercel.app", // Vercel deployment
  "https://dara-forge-production.up.railway.app", // Railway deployment (update with your actual domain)
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
];
```

Then redeploy the Render API server.

## Testing the Deployment

### 1. Check Build Logs

Monitor Railway build logs to ensure:

- ✅ Dependencies install successfully
- ✅ TypeScript compiles without errors
- ✅ Vite build completes
- ✅ Preview server starts on PORT

### 2. Test API Connection

Open browser console on your Railway URL and check:

```javascript
// Should show Render API URL
window.DARA_API_BASE;
// "https://dara-api.onrender.com"

// Test API connectivity
fetch(`${window.DARA_API_BASE}/health`)
  .then((r) => r.json())
  .then(console.log);
// Should return: {status: 'healthy', timestamp: '...', env: 'production'}
```

### 3. Test Full Pipeline

1. Navigate to `/pipeline`
2. Upload a test file
3. Check browser Network tab for API calls
4. Verify all steps complete successfully

## Environment Variables Reference

| Variable            | Value                               | Purpose                                |
| ------------------- | ----------------------------------- | -------------------------------------- |
| `VITE_API_BASE_URL` | `https://dara-api.onrender.com`     | Routes all API calls to Render backend |
| `NODE_ENV`          | `production`                        | Enables production optimizations       |
| `PORT`              | `3000` (Railway sets automatically) | Server port                            |

## Troubleshooting

### Build Fails

- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors

### API Calls Fail

1. **Check CORS**: Ensure Railway domain is in `allowedOrigins` on Render
2. **Check Environment Variable**: Verify `VITE_API_BASE_URL` is set in Railway
3. **Check Network Tab**: Look for CORS or 404 errors

### Preview Server Won't Start

- Ensure `preview` script uses `--host 0.0.0.0 --port $PORT`
- Check Railway logs for port binding errors

## Comparison: Railway vs Vercel

This setup allows you to compare:

- **Railway**: `https://your-app.up.railway.app` → Tests if issue is Vercel-specific
- **Vercel**: `https://dara-forge.vercel.app` → Current deployment

Both should work identically since they use the same backend API on Render.

## Redeployment

To redeploy:

1. Push changes to GitHub `main` branch
2. Railway automatically rebuilds and redeploys
3. No manual intervention needed

## Cost

Railway free tier includes:

- $5 of usage credits per month
- Automatic scaling
- Custom domains
- Instant deployments

Perfect for testing and comparison purposes!
