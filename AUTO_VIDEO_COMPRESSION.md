# Large Video Upload Fix - Direct GitHub API Upload

## Problem
- Vercel free tier has a **4.5MB body size limit** for serverless functions
- Videos larger than 4.5MB were causing the `/api/upload` route to crash
- Error: "Request Entity Too Large" or JSON parse errors

## Solution
Implemented **direct client-side upload to GitHub API** to bypass Vercel's API route entirely.

## Changes Made

### 1. Updated `src/lib/githubImageUpload.ts`
- **Before**: Uploaded via `/api/upload` route (limited to 4.5MB)
- **After**: Direct upload to GitHub API from browser (supports up to 100MB)

### Key Features:
- ✅ Supports files up to **100MB** (GitHub's limit)
- ✅ No Vercel API route involved (bypasses 4.5MB limit)
- ✅ Client-side base64 conversion
- ✅ Automatic retry logic for file conflicts (422 errors)
- ✅ Unique filename generation with timestamps and random strings
- ✅ Separate folders for images and videos
- ✅ Detailed error messages with troubleshooting steps

### 2. How It Works
```
User uploads video → Browser converts to base64 → Direct GitHub API call → File stored in repo
```

**No server-side processing = No Vercel limits!**

### 3. File Size Limits
- **Old limit**: 4.5MB (Vercel API route)
- **New limit**: 100MB (GitHub API)
- **Recommended**: Keep videos under 50MB for faster uploads

## Environment Variables Required

Make sure these are set in Vercel:
```env
NEXT_PUBLIC_GITHUB_OWNER=elightsofaandcurtains
NEXT_PUBLIC_GITHUB_REPO=elight-sofa
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_GITHUB_IMAGE_PATH=images/products
```

**Important**: The GitHub token must have:
- ✅ "repo" scope enabled
- ✅ No expiration (or set to a far future date)
- ✅ Access to the repository

## File Storage Structure
```
elight-sofa/
├── images/products/     # Images uploaded here
└── videos/products/     # Videos uploaded here
```

## Testing
1. Try uploading a video > 4.5MB (should work now!)
2. Try uploading a video up to 100MB (should work, but may be slow)
3. Check browser console for upload progress logs

## Troubleshooting

### If upload fails with 401 error:
- GitHub token is invalid or expired
- Generate new token at: https://github.com/settings/tokens
- Ensure "repo" scope is checked
- Update `NEXT_PUBLIC_GITHUB_TOKEN` in Vercel

### If upload fails with 403 error:
- Token lacks permissions
- Regenerate token with "repo" scope

### If upload fails with 404 error:
- Repository name is incorrect
- Check `NEXT_PUBLIC_GITHUB_OWNER` and `NEXT_PUBLIC_GITHUB_REPO`

### If upload is very slow:
- File is very large (50-100MB)
- Consider compressing to 20-30MB for better UX
- Use: https://www.freeconvert.com/video-compressor

## Benefits
✅ No more 4.5MB limit!
✅ Upload videos up to 100MB
✅ Faster uploads (no server processing)
✅ Better error handling
✅ Automatic retries for conflicts
✅ Works on Vercel free tier

## Deployment
Changes deployed to Vercel. The app will automatically use the new direct upload method.
