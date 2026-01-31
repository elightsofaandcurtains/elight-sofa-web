# 🚀 Deploy to Vercel - Complete Guide

## ⚠️ Git Authentication Required

You need to authenticate with GitHub before pushing.

---

## 🔐 Option 1: GitHub Desktop (Easiest)

### Step 1: Install GitHub Desktop
1. Download: https://desktop.github.com/
2. Install and open GitHub Desktop
3. Sign in with your GitHub account

### Step 2: Open Repository
1. File → Add Local Repository
2. Browse to: `C:\Users\Y AKBARI\OneDrive\Desktop\Elight-web\Elight-web`
3. Click "Add Repository"

### Step 3: Push Changes
1. You'll see all your changes listed
2. Click "Push origin" button at top
3. Done! Vercel will auto-deploy

---

## 🔐 Option 2: Personal Access Token (Command Line)

### Step 1: Generate GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `Git Push Token`
4. Expiration: 90 days (or No expiration)
5. Scopes: Check **"repo"** (full control)
6. Click "Generate token"
7. **Copy the token** (you won't see it again!)

### Step 2: Configure Git Credential
Run these commands:

```cmd
git config credential.helper store
git push origin main
```

When prompted:
- Username: `elightsofaandcurtains`
- Password: `paste_your_token_here`

### Step 3: Push
```cmd
git push origin main
```

---

## 🔐 Option 3: SSH Key (Advanced)

### Step 1: Generate SSH Key
```cmd
ssh-keygen -t ed25519 -C "your_email@example.com"
```
Press Enter for all prompts (use defaults)

### Step 2: Copy Public Key
```cmd
type %USERPROFILE%\.ssh\id_ed25519.pub
```
Copy the output

### Step 3: Add to GitHub
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: `Elight Laptop`
4. Paste the key
5. Click "Add SSH key"

### Step 4: Change Remote URL
```cmd
git remote set-url origin git@github.com:elightsofaandcurtains/elight-sofa-web.git
```

### Step 5: Push
```cmd
git push origin main
```

---

## 🚀 After Successful Push

### Vercel Auto-Deploy:
1. Push triggers automatic deployment
2. Vercel builds your app
3. Deploys to production
4. Usually takes 2-5 minutes

### Check Deployment Status:
1. Go to: https://vercel.com/dashboard
2. Find your project: `elight-sofa-web`
3. See deployment progress
4. Click on deployment for logs

### Deployment URL:
Your site will be live at:
- Production: `https://elight-sofa-web.vercel.app`
- Or your custom domain if configured

---

## ✅ What Will Be Deployed

### New Features:
1. ✅ **Auto Video Compression** - Videos > 90MB auto-compress
2. ✅ **Token Validation** - Checks GitHub token before upload
3. ✅ **Autoplay Video** - Homepage craftsmanship section
4. ✅ **Newsletter Removed** - Cleaner footer
5. ✅ **Better Error Messages** - Detailed upload errors
6. ✅ **422 Error Fix** - Auto-retry on file conflicts

### Files Deployed:
- Updated upload API with validation
- Video compression library
- Homepage with autoplay video
- Footer without newsletter
- Product modal with auto-compression
- Test scripts and documentation

---

## 🔍 Verify Deployment

### After Deployment Completes:

1. **Visit Your Site:**
   - Go to your Vercel URL
   - Check homepage loads

2. **Test Autoplay Video:**
   - Scroll to "Experience the Craftsmanship"
   - Video should autoplay

3. **Test Admin Upload:**
   - Login to admin panel
   - Try uploading an image
   - Should work without errors

4. **Check Footer:**
   - Scroll to bottom
   - Newsletter section should be gone

---

## ⚠️ Important: Environment Variables

### Vercel Needs Your .env Variables!

Your `.env.local` file is NOT deployed (it's in .gitignore for security).

### Add Environment Variables to Vercel:

1. **Go to Vercel Dashboard:**
   https://vercel.com/dashboard

2. **Select Your Project:**
   Click on `elight-sofa-web`

3. **Go to Settings:**
   Click "Settings" tab

4. **Environment Variables:**
   Click "Environment Variables" in sidebar

5. **Add Each Variable:**
   Copy from your `.env.local` and add:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDwECc2OJR6V5lFv2lCRdsVhgbenGW35gc
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=elight-sofa.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=elight-sofa
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=elight-sofa.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=700236647248
   NEXT_PUBLIC_FIREBASE_APP_ID=1:700236647248:web:274b32f4529da1d6257a55
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-V9W91XSGKV
   
   NEXT_PUBLIC_GITHUB_OWNER=elightsofaandcurtains
   NEXT_PUBLIC_GITHUB_REPO=elight-sofa
   NEXT_PUBLIC_GITHUB_BRANCH=main
   NEXT_PUBLIC_GITHUB_IMAGE_PATH=images/products
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
   ```

6. **Select Environment:**
   - Check: Production, Preview, Development
   - Click "Save"

7. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 📝 Quick Commands Reference

### Check Status:
```cmd
git status
```

### Add All Changes:
```cmd
git add .
```

### Commit Changes:
```cmd
git commit -m "Your message here"
```

### Push to GitHub (triggers Vercel deploy):
```cmd
git push origin main
```

### View Remote URL:
```cmd
git remote -v
```

---

## 🆘 Troubleshooting

### Issue: "Authentication failed"
**Solution:** Use GitHub Desktop or generate Personal Access Token

### Issue: "Permission denied"
**Solution:** Check GitHub account has access to repository

### Issue: "Remote rejected"
**Solution:** Check if branch is protected, may need admin approval

### Issue: Vercel not deploying
**Solution:** 
1. Check Vercel dashboard for errors
2. Verify GitHub integration is connected
3. Check build logs for errors

### Issue: Site works locally but not on Vercel
**Solution:**
1. Check environment variables are set in Vercel
2. Check build logs for missing dependencies
3. Verify all imports are correct

---

## 🎯 Recommended: Use GitHub Desktop

**Why GitHub Desktop?**
- ✅ No command line needed
- ✅ Visual interface
- ✅ Automatic authentication
- ✅ Easy to see changes
- ✅ One-click push

**Download:** https://desktop.github.com/

---

## 📊 Summary

**Current Status:** Changes committed locally, need to push  
**Authentication:** Required before push  
**Recommended:** Use GitHub Desktop (easiest)  
**Alternative:** Personal Access Token  
**After Push:** Vercel auto-deploys (2-5 minutes)  
**Don't Forget:** Add environment variables to Vercel  

**Next Steps:**
1. Choose authentication method (GitHub Desktop recommended)
2. Push changes to GitHub
3. Wait for Vercel deployment
4. Add environment variables to Vercel
5. Test deployed site

---

## 🎉 After Deployment

Your site will have:
- ✅ Auto video compression
- ✅ Token validation
- ✅ Autoplay video on homepage
- ✅ No newsletter in footer
- ✅ Better error handling
- ✅ All latest features

**Ready to deploy!** 🚀
