# Video Upload Guide - Fix 500 Error

## ❌ Problem: "GitHub error: 500" When Uploading Videos

### Why This Happens:
- **GitHub API limit: 100MB per file**
- Your video file is likely too large
- GitHub returns 500 error when file exceeds limits or upload times out

---

## ✅ Solution: Compress Your Video

### Quick Check - What's Your Video Size?
1. Right-click the video file
2. Click "Properties"
3. Check the "Size" - is it > 50MB?

**If YES → You need to compress it**

---

## 🎬 How to Compress Videos

### Option 1: Online Tools (Easiest)

#### **CloudConvert** (Recommended)
1. Go to: https://cloudconvert.com/mp4-compress
2. Upload your video
3. Settings:
   - Format: MP4
   - Quality: Medium (or adjust slider)
   - Target size: < 50MB
4. Click "Start Conversion"
5. Download compressed video

#### **FreeConvert**
1. Go to: https://www.freeconvert.com/video-compressor
2. Upload video
3. Set target size: 50MB
4. Compress and download

#### **Online-Convert**
1. Go to: https://www.online-convert.com/
2. Choose "Video Converter" → "Convert to MP4"
3. Upload video
4. Optional settings:
   - Resolution: 1080p or 720p
   - Bitrate: 2000-5000 kbps
5. Convert and download

### Option 2: Desktop Software (Best Quality)

#### **HandBrake** (Free, Windows/Mac/Linux)
1. Download: https://handbrake.fr/
2. Install and open HandBrake
3. Click "Open Source" → Select your video
4. Settings:
   - Preset: "Fast 1080p30" or "Fast 720p30"
   - Format: MP4
   - Video Codec: H.264
   - Quality: RF 22-28 (lower = better quality, larger file)
5. Click "Start Encode"
6. Result will be much smaller

**HandBrake Tips:**
- RF 22 = High quality (~30-50MB for 1-2 min video)
- RF 28 = Medium quality (~10-20MB for 1-2 min video)
- Lower resolution (720p) = smaller file

#### **VLC Media Player** (Free, Already Installed?)
1. Open VLC
2. Media → Convert/Save
3. Add your video file
4. Click "Convert/Save"
5. Profile: "Video - H.264 + MP3 (MP4)"
6. Click "Edit" (wrench icon):
   - Video codec: H.264
   - Bitrate: 2000 kb/s
   - Resolution: 1920x1080 or 1280x720
7. Choose destination file
8. Click "Start"

---

## 📊 Recommended Video Settings

### For Product Videos (1-2 minutes):
- **Format:** MP4
- **Resolution:** 1080p (1920x1080) or 720p (1280x720)
- **Bitrate:** 2000-5000 kbps
- **Frame Rate:** 30 fps
- **Target Size:** < 50MB (ideal), < 100MB (maximum)

### Quality vs Size Guide:
| Duration | Resolution | Bitrate | Approx Size |
|----------|-----------|---------|-------------|
| 30 sec   | 1080p     | 5000 kbps | ~20MB |
| 1 min    | 1080p     | 5000 kbps | ~40MB |
| 2 min    | 1080p     | 5000 kbps | ~80MB |
| 1 min    | 720p      | 3000 kbps | ~25MB |
| 2 min    | 720p      | 3000 kbps | ~50MB |

---

## 🚀 After Compressing

### Upload Steps:
1. Compress video to < 50MB
2. Go to Admin → Products → Add Product
3. Click "Upload Videos" section
4. Select compressed video
5. Wait for upload (watch console for progress)
6. Should see: ✅ Upload successful

### What You'll See in Console:

**If file is too large (> 100MB):**
```
📤 Uploading file: {name: 'video.mp4', size: '125.5 MB'}
❌ File too large (125.5MB). Maximum size is 100MB. Please compress the video and try again.
```

**If file is large but acceptable (50-100MB):**
```
📤 Uploading file: {name: 'video.mp4', size: '75.2 MB'}
⚠️ Large file (75.2MB) - upload may take a while
🔄 Uploading via API route...
✅ Upload successful
```

**If file is good size (< 50MB):**
```
📤 Uploading file: {name: 'video.mp4', size: '35.8 MB'}
🔄 Uploading via API route...
✅ Upload successful
```

---

## 🔧 Code Updates Applied

### What I Fixed:
1. ✅ Added file size check (100MB limit)
2. ✅ Better error messages for 500 errors
3. ✅ Warning for large files (50-100MB)
4. ✅ Timeout error handling (502/504)

### Files Updated:
- `src/app/api/upload/route.ts` - Server-side size check
- `src/lib/githubImageUpload.ts` - Client-side size check

### New Error Messages:
- **> 100MB:** "File too large (XXX MB). Maximum size is 100MB. Please compress..."
- **500 error:** "GitHub server error. File might be too large (XXX MB). Try compressing to < 50MB."
- **Timeout:** "Upload timeout. File too large (XXX MB). Please compress and try again."

---

## 📝 Quick Checklist

Before uploading videos:
- [ ] Check video file size (right-click → Properties)
- [ ] If > 50MB, compress it
- [ ] Use MP4 format
- [ ] Resolution: 1080p or 720p
- [ ] Upload and check console for success message

---

## 💡 Pro Tips

### For Best Results:
1. **Keep videos short** (30 sec - 2 min)
2. **Use 720p for longer videos** (saves space)
3. **Use 1080p for short demos** (better quality)
4. **Test upload with small file first** (verify it works)
5. **Compress before uploading** (don't rely on max limit)

### Video Content Ideas:
- Product 360° rotation (15-30 sec)
- Close-up of material/texture (10-20 sec)
- Assembly/features demo (30-60 sec)
- Room setup showcase (20-40 sec)

### Avoid:
- ❌ Long videos (> 3 min) - too large
- ❌ 4K resolution - unnecessary for web
- ❌ High frame rates (60fps) - 30fps is enough
- ❌ Uncompressed formats (AVI, MOV) - use MP4

---

## 🆘 Still Having Issues?

### If compression doesn't help:
1. Check video duration - maybe too long?
2. Try lower resolution (720p instead of 1080p)
3. Try lower bitrate (2000 kbps instead of 5000)
4. Split long video into multiple shorter clips

### If upload still fails:
1. Check internet connection
2. Try uploading from different network
3. Wait 5-10 minutes (GitHub rate limit)
4. Check console for specific error message

### Alternative: Use YouTube/Vimeo
If videos are too large even after compression:
1. Upload to YouTube (unlisted)
2. Get embed URL
3. Add to product description
4. Or use video URL field if available

---

## 📞 Summary

**Problem:** Video upload fails with 500 error  
**Cause:** File too large (> 100MB) or timeout  
**Solution:** Compress video to < 50MB using online tool or HandBrake  
**Format:** MP4, 1080p or 720p, 2000-5000 kbps bitrate  
**Status:** ✅ Code updated with size checks and better errors
