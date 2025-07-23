# Vercel Deployment Guide

## Quick Deployment

### Option 1: Via GitHub Integration (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import repository: `mynkchaudhry/llmcostcalculator`
5. Add environment variables in Vercel dashboard
6. Deploy

### Option 2: Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Environment Variables to Add in Vercel Dashboard

You need to add these environment variables with your actual values:

- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_SECRET` - Your NextAuth secret key  
- `NEXTAUTH_URL` - Your Vercel app URL (https://your-app.vercel.app)
- `GITHUB_ID` - Your GitHub OAuth client ID
- `GITHUB_SECRET` - Your GitHub OAuth client secret
- `GROQ_API_KEY` - Your Groq API key
- `LINKUP_API_KEY` - Your Linkup API key

## After Deployment

1. Get your Vercel app URL (https://your-app.vercel.app)
2. Update GitHub OAuth app settings:
   - Homepage URL: Your Vercel app URL
   - Callback URL: Your Vercel app URL + `/api/auth/callback/github`
3. Update `NEXTAUTH_URL` environment variable in Vercel with your app URL

Your app will be live and ready to use!