# GitHub Token - No Expiry Setup Guide

## 🔐 Current Status

Your token is **valid** but may have an expiration date set.

---

## ✅ How to Create a Token with NO EXPIRATION

### Step 1: Go to GitHub Token Settings
1. Open: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**

### Step 2: Configure Token Settings

**Name:** `Elight Sofa Upload - No Expiry`

**Expiration:** Select **"No expiration"** ⚠️ IMPORTANT!

**Scopes:** Check these permissions:
- ✅ **repo** (Full control of private repositories)
  - ✅ repo:status
  - ✅ repo_deployment
  - ✅ public_repo
  - ✅ repo:invite
  - ✅ security_events

### Step 3: Generate and Copy Token
1. Scroll down and click **"Generate token"**
2. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
3. Token will look like: `github_pat_11B4Q6ZFI0lAaChZcPnEz8_...`

### Step 4: Update .env.local
1. Open `.env.local` file
2. Replace the old token:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_new_token_here
   ```
3. Save the file

### Step 5: Restart Dev Server
```cmd
# Stop server: Ctrl + C
npm run dev
```

---

## ⚠️ Important Notes

### Why "No Expiration"?
- ✅ Token never expires
- ✅ No interruption to uploads
- ✅ No need to regenerate periodically
- ⚠️ Keep it secure (don't share publicly)

### Security Best Practices:
1. **Never commit token to Git** (already in .gitignore)
2. **Use environment variables** (already done)
3. **Limit scope to only what's needed** (repo access only)
4. **Regenerate if compromised**

### If Token is Compromised:
1. Go to https://github.com/settings/tokens
2. Click "Delete" on the compromised token
3. Generate a new one following steps above
4. Update `.env.local` with new token

---

## 🔍 Verify Token Has No Expiry

After creating the token, check:
1. Go to https://github.com/settings/tokens
2. Find your token in the list
3. Check "Expires" column - should say **"Never"**

---

## 🛡️ Backup Plan

If you ever need to regenerate:
1. Keep old token active while generating new one
2. Generate new token with same settings
3. Update `.env.local` with new token
4. Test with: `node scripts/test-github-token.js`
5. Delete old token from GitHub

---

## ✅ Checklist

- [ ] Go to https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Set name: "Elight Sofa Upload - No Expiry"
- [ ] Set expiration: **"No expiration"**
- [ ] Check scope: **"repo"**
- [ ] Click "Generate token"
- [ ] Copy token immediately
- [ ] Update `.env.local` with new token
- [ ] Restart dev server
- [ ] Test with: `node scripts/test-github-token.js`
- [ ] Verify "Expires: Never" on GitHub

---

## 🎯 Summary

**Action:** Create new GitHub token with NO EXPIRATION  
**Expiration:** Select "No expiration" when creating  
**Scope:** repo (full control)  
**Update:** `.env.local` → NEXT_PUBLIC_GITHUB_TOKEN  
**Test:** `node scripts/test-github-token.js`  
**Result:** Token will never expire, uploads will always work
