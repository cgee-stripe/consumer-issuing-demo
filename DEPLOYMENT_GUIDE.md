# Deployment Guide - Vercel

## Quick Deploy (Recommended)

### 1. Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "Add New Project"
4. Import your `dog-marketplace` repository
5. Vercel auto-detects Next.js - just click "Deploy"

### 3. Add Environment Variables
After deployment, go to your project settings:
- Settings → Environment Variables
- Add:
  - `STRIPE_SECRET_KEY` → Your Stripe secret key
  - `STRIPE_CONNECTED_ACCOUNT_ID` → Your connected account ID

### 4. Redeploy
Click "Redeploy" to apply the environment variables.

## That's it! 🎉

Your app will be live at: `https://your-project-name.vercel.app`

## Why Vercel?
- **Zero config** - Automatically detects Next.js settings
- **Fast builds** - Optimized for Next.js
- **Free tier** - Perfect for demos
- **Auto HTTPS** - Secure by default
- **Global CDN** - Fast worldwide
- **No file upload limits** - Builds from git, ignores node_modules

## Alternative: Railway (Also Good)
If you want an alternative:
1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub
3. Add environment variables
4. Railway will build and deploy automatically

## Don't Upload node_modules!
When deploying, make sure you have a `.gitignore` file that excludes:
- node_modules/
- .next/
- .env.local

These will be rebuilt on the server automatically.
