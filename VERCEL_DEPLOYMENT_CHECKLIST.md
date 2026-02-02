# Vercel Deployment Checklist - Large Video Upload Fix

## ✅ Code Changes Deployed
- Direct GitHub API upload implemented
- Bypasses Vercel 4.5MB limit
- Supports up to 100MB files

## 🔧 CRITICAL: Verify Environment Variables in Vercel

### Go to Vercel Dashboard:
1. Open: https://vercel.com/dashboard
2. Select your project: `elight-sofa-web`
3. Go to: **Settings** → **Environment Variables**

### Required Variables:
Make sure ALL of these are set:

```
NEXT_PUBLIC_GITHUB_OWNER=elightsofaandcurtains
NEXT_PUBLIC_GITHUB_REPO=elight-sofa
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_GITHUB_IMAGE_PATH=images/products
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
```

### ⚠️ IMPORTANT: GitHub Token
The token **MUST** have:
- ✅ "repo" scope (full repository access)
- ✅ No expiration or far future expiration
- ✅ Access to `elightsofaandcurtains/elight-sofa` repository

### If Token is Missing or Invalid:
1. Go to: https://github.com/settings/tokens
2. Click: **Generate new token (classic)**
3. Set:
   - Name: `Vercel Upload Token`
   - Expiration: **No expiration**
   - Scopes: Check **"repo"** (all sub-scopes)
4. Click: **Generate token**
5. Copy the token (starts with `github_pat_`)
6. Add to Vercel environment variables as `NEXT_PUBLIC_GITHUB_TOKEN`
7. **Redeploy** the app in Vercel

## 🚀 After Setting Environment Variables

### Trigger Redeploy:
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click **"Redeploy"** button
4. Wait for deployment to complete

OR

Make a small change and push to GitHub (auto-deploys)

## 🧪 Testing After Deployment

1. Go to your deployed site
2. Navigate to Admin → Products → Add Product
3. Try uploading a video **larger than 4.5MB**
4. Should work without errors!

### Expected Behavior:
- ✅ Videos up to 100MB upload successfully
- ✅ No "Request Entity Too Large" errors
- ✅ No JSON parse errors
- ✅ Upload progress shown in browser console
- ✅ Video URL returned and saved to product

### If Still Not Working:
1. Open browser console (F12)
2. Try uploading a video
3. Check for errors
4. Look for messages starting with 📤, 🔄, ✅, or ❌
5. Share the error message

## 📊 Current Status
- ✅ Code pushed to GitHub
- ✅ Vercel auto-deployment triggered
- ⏳ Waiting for deployment to complete
- ⚠️ Need to verify environment variables are set

## 🎯 Next Steps
1. Wait for Vercel deployment to finish (~2-3 minutes)
2. Verify environment variables in Vercel dashboard
3. Test video upload with file > 4.5MB
4. Confirm it works!
