# 🔧 Vercel Environment Variables Setup

## ⚠️ CRITICAL: Your .env.local is NOT deployed!

The `.env.local` file is in `.gitignore` for security, so Vercel doesn't have your environment variables.

## 🚀 Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your project: **elight-sofa-web**

### Step 2: Open Settings
1. Click the **Settings** tab at the top
2. Click **Environment Variables** in the left sidebar

### Step 3: Add ALL These Variables

Copy these one by one and add them to Vercel:

#### Firebase Variables (Required)
```
NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyDwECc2OJR6V5lFv2lCRdsVhgbenGW35gc

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: elight-sofa.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: elight-sofa

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: elight-sofa.firebasestorage.app

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 700236647248

NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:700236647248:web:274b32f4529da1d6257a55

NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
Value: G-V9W91XSGKV
```

#### GitHub Variables (Required for Video Upload)
```
NEXT_PUBLIC_GITHUB_OWNER
Value: elightsofaandcurtains

NEXT_PUBLIC_GITHUB_REPO
Value: elight-sofa

NEXT_PUBLIC_GITHUB_BRANCH
Value: main

NEXT_PUBLIC_GITHUB_IMAGE_PATH
Value: images/products

NEXT_PUBLIC_GITHUB_TOKEN
Value: [YOUR_GITHUB_TOKEN_HERE - Get from .env.local file]
```

### Step 4: For Each Variable:
1. Click **Add New** button
2. Enter the **Key** (variable name)
3. Enter the **Value**
4. Select environments: ✅ Production ✅ Preview ✅ Development
5. Click **Save**

### Step 5: Redeploy
After adding ALL variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

## 🔍 How to Get Your GitHub Token

Your GitHub token is in your local `.env.local` file:

1. Open: `C:\Users\Y AKBARI\OneDrive\Desktop\Elight-web\Elight-web\.env.local`
2. Find the line: `NEXT_PUBLIC_GITHUB_TOKEN=...`
3. Copy the token value (starts with `github_pat_`)
4. Paste it in Vercel

**⚠️ IMPORTANT:** 
- The token in your `.env.local` file is the correct one
- Don't use the placeholder from the guide
- Make sure to copy the FULL token

## ✅ Verify It's Working

After redeployment:

1. **Go to your live site**
2. **Login to admin panel**
3. **Try uploading a video**
4. **Should work now!**

## 🆘 Still Not Working?

### Check Browser Console:
1. Open your deployed site
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Try uploading a video
5. Look for error messages

### Common Errors:

**"GitHub not configured"**
- ❌ Environment variables not added to Vercel
- ✅ Add all variables and redeploy

**"Token is INVALID or EXPIRED"**
- ❌ Wrong token or token expired
- ✅ Generate new token: https://github.com/settings/tokens
- ✅ Set expiration to "No expiration"
- ✅ Check "repo" scope
- ✅ Update in Vercel

**"File too large"**
- ❌ Video is > 100MB
- ✅ Compress video before uploading
- ✅ Use video compression tool

**"Upload timeout"**
- ❌ Video is too large (50-100MB)
- ✅ Compress to < 50MB for faster upload

## 📝 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Found elight-sofa-web project
- [ ] Went to Settings → Environment Variables
- [ ] Added ALL 11 environment variables
- [ ] Selected Production, Preview, Development for each
- [ ] Saved all variables
- [ ] Went to Deployments tab
- [ ] Redeployed the latest deployment
- [ ] Waited for deployment to complete
- [ ] Tested video upload on live site

## 🎯 Expected Result

After completing these steps:
- ✅ Video upload should work
- ✅ Image upload should work
- ✅ Firebase authentication should work
- ✅ All features should work like localhost

## 📞 Need Help?

If still not working:
1. Check Vercel deployment logs for errors
2. Check browser console for errors
3. Verify all 11 environment variables are set
4. Make sure you redeployed after adding variables

---

**Remember:** Environment variables are NOT automatically deployed. You MUST add them manually in Vercel Dashboard!
w