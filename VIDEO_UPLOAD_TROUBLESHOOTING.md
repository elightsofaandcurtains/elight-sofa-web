# 🎥 Video Upload Troubleshooting Guide

## Error: "Unexpected token 'R', 'Request En'... is not valid JSON"

This error means the API is returning HTML (an error page) instead of JSON.

## 🔍 Root Causes

### 1. **Vercel Function Timeout** (Most Common)
- Vercel free tier has 10-second timeout
- Large videos (>50MB) take longer to upload
- Solution: Compress video or upgrade Vercel plan

### 2. **Missing Environment Variables**
- GitHub token not set in Vercel
- Solution: Add all env vars in Vercel Dashboard

### 3. **File Too Large**
- Video exceeds 100MB (GitHub limit)
- Solution: Compress video

### 4. **Memory Limit**
- Vercel function runs out of memory
- Solution: Compress video or upgrade plan

## ✅ Quick Fixes

### Fix 1: Compress Your Video (RECOMMENDED)

**Before uploading, compress your video:**

1. **Use Online Tool:**
   - Go to: https://www.freeconvert.com/video-compressor
   - Upload your video
   - Set quality to 720p or 1080p
   - Target size: < 50MB
   - Download compressed video

2. **Or Use HandBrake (Desktop App):**
   - Download: https://handbrake.fr/
   - Open your video
   - Preset: "Fast 1080p30"
   - Start encode
   - Result: Much smaller file

**Target Sizes:**
- ✅ < 20MB: Fast upload, no issues
- ⚠️ 20-50MB: Slower, but should work
- ❌ > 50MB: May timeout, compress first

### Fix 2: Verify Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your project: **elight-sofa-web**
3. Settings → Environment Variables
4. Verify these exist:
   ```
   NEXT_PUBLIC_GITHUB_OWNER
   NEXT_PUBLIC_GITHUB_REPO
   NEXT_PUBLIC_GITHUB_TOKEN
   NEXT_PUBLIC_GITHUB_BRANCH
   ```
5. If missing, add them
6. Redeploy

### Fix 3: Check Vercel Logs

1. Go to Vercel Dashboard
2. Click your project
3. Click latest deployment
4. Click "Functions" tab
5. Find `/api/upload`
6. Check for errors

Common errors in logs:
- "Function timeout": Video too large
- "Out of memory": Video too large
- "401 Unauthorized": Wrong GitHub token
- "422 Unprocessable": File conflict

### Fix 4: Test with Small File First

1. Try uploading a small image (< 1MB)
2. If image works but video doesn't:
   - Problem is video size
   - Compress video
3. If image also fails:
   - Problem is configuration
   - Check environment variables

## 🎯 Recommended Workflow

### For Videos:

1. **Record/Get Video**
2. **Check Size:**
   - Right-click → Properties
   - If > 50MB, compress it
3. **Compress (if needed):**
   - Use online tool or HandBrake
   - Target: < 30MB for best results
4. **Upload:**
   - Should work smoothly now

### Video Compression Settings:

**For Product Videos:**
- Resolution: 1080p (1920x1080)
- Frame Rate: 30fps
- Bitrate: 2-4 Mbps
- Format: MP4 (H.264)
- Audio: AAC, 128kbps

**For Demo Videos:**
- Resolution: 720p (1280x720)
- Frame Rate: 30fps
- Bitrate: 1-2 Mbps
- Format: MP4 (H.264)

## 🔧 Advanced Fixes

### If Still Not Working After Compression:

#### Option 1: Upgrade Vercel Plan
- Free: 10s timeout, 1024MB memory
- Pro: 60s timeout, 3008MB memory
- Allows larger file uploads

#### Option 2: Use Different Upload Method
- Upload to YouTube/Vimeo
- Embed video URL in product
- Faster and more reliable

#### Option 3: Split Large Videos
- Split video into smaller parts
- Upload separately
- Combine in product gallery

## 📊 File Size Guidelines

| Size | Upload Time | Success Rate | Recommendation |
|------|-------------|--------------|----------------|
| < 10MB | < 5s | 99% | ✅ Perfect |
| 10-30MB | 5-15s | 95% | ✅ Good |
| 30-50MB | 15-30s | 80% | ⚠️ Compress if possible |
| 50-100MB | 30-60s | 50% | ❌ Compress required |
| > 100MB | Timeout | 0% | ❌ Not supported |

## 🆘 Still Having Issues?

### Check These:

1. **Video Format:**
   - ✅ MP4, WebM, MOV
   - ❌ AVI, MKV, FLV (convert to MP4)

2. **Internet Connection:**
   - Stable connection required
   - Upload may fail on slow/unstable connection

3. **Browser:**
   - Try different browser
   - Clear cache and cookies
   - Disable extensions

4. **GitHub Token:**
   - Check if expired
   - Generate new token if needed
   - Ensure "repo" scope is checked

### Generate New GitHub Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Elight Sofa Upload"
4. Expiration: **No expiration**
5. Scopes: Check **"repo"**
6. Generate and copy token
7. Update in Vercel: Settings → Environment Variables
8. Update `NEXT_PUBLIC_GITHUB_TOKEN`
9. Redeploy

## ✅ Success Checklist

Before uploading video:
- [ ] Video is < 50MB (check file properties)
- [ ] Video is MP4 format
- [ ] Environment variables set in Vercel
- [ ] Redeployed after adding env vars
- [ ] Tested with small image first
- [ ] Stable internet connection
- [ ] Using Chrome or Firefox

## 🎉 Expected Result

After following this guide:
- ✅ Videos < 50MB upload successfully
- ✅ Upload completes in < 30 seconds
- ✅ Video appears in product gallery
- ✅ Video plays correctly on site

---

**Remember:** The most common issue is file size. Compress your video to < 30MB for best results!
