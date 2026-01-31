# 🎥 Video Compression Guide - REQUIRED for Upload

## ⚠️ CRITICAL: Vercel Free Tier Limit

**Maximum upload size: 4.5MB**

Your video is likely larger than this. You MUST compress it before uploading.

## 🚀 Quick Compression (5 minutes)

### Method 1: Online Tool (Easiest)

1. **Go to:** https://www.freeconvert.com/video-compressor

2. **Upload your video**

3. **Settings:**
   - Resolution: **720p** (1280x720)
   - Bitrate: **2 Mbps**
   - Format: **MP4**
   - Audio: **128 kbps**

4. **Click "Compress Video"**

5. **Download** the compressed file

6. **Check size:**
   - Right-click → Properties
   - Should be < 4MB
   - If still too large, repeat with lower bitrate (1.5 Mbps)

7. **Upload to your site**

### Method 2: HandBrake (Desktop App)

1. **Download:** https://handbrake.fr/

2. **Install and open HandBrake**

3. **Open your video file**

4. **Settings:**
   - Preset: **"Fast 720p30"**
   - Or manually set:
     - Resolution: 1280x720
     - Frame Rate: 30 fps
     - Video Bitrate: 2000 kbps
     - Audio Bitrate: 128 kbps

5. **Click "Start Encode"**

6. **Check output size** (should be < 4MB)

7. **Upload to your site**

## 📊 Target Specifications

For product videos to fit under 4.5MB:

| Setting | Value | Why |
|---------|-------|-----|
| Resolution | 720p (1280x720) | Good quality, smaller size |
| Frame Rate | 30 fps | Smooth playback |
| Video Bitrate | 1.5-2 Mbps | Balance quality/size |
| Audio Bitrate | 128 kbps | Clear audio |
| Format | MP4 (H.264) | Best compatibility |
| Duration | < 30 seconds | Shorter = smaller |

## 🎯 Size Estimation

**Formula:** `(Video Bitrate + Audio Bitrate) × Duration ÷ 8 = File Size`

**Examples:**

| Duration | Bitrate | Estimated Size |
|----------|---------|----------------|
| 10 sec | 2 Mbps | ~2.5 MB ✅ |
| 20 sec | 2 Mbps | ~5 MB ❌ |
| 20 sec | 1.5 Mbps | ~3.8 MB ✅ |
| 30 sec | 1 Mbps | ~3.8 MB ✅ |

## ⚡ Quick Tips

### To Reduce File Size:

1. **Lower Resolution:**
   - 1080p → 720p (saves ~50%)
   - 720p → 480p (saves another 50%)

2. **Lower Bitrate:**
   - 4 Mbps → 2 Mbps (saves 50%)
   - 2 Mbps → 1 Mbps (saves another 50%)

3. **Shorten Duration:**
   - 60 sec → 30 sec (saves 50%)
   - 30 sec → 15 sec (saves another 50%)

4. **Remove Audio:**
   - If not needed, remove audio track
   - Saves ~10-15%

### Quality vs Size:

| Quality | Resolution | Bitrate | Size (30s) |
|---------|-----------|---------|------------|
| High | 1080p | 4 Mbps | ~15 MB ❌ |
| Medium | 720p | 2 Mbps | ~7.5 MB ❌ |
| Good | 720p | 1.5 Mbps | ~5.6 MB ❌ |
| **Optimal** | **720p** | **1 Mbps** | **~3.8 MB** ✅ |
| Low | 480p | 1 Mbps | ~2.5 MB ✅ |

## 🔧 Advanced: FFmpeg Command

If you have FFmpeg installed:

```bash
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -b:v 1M -c:a aac -b:a 128k output.mp4
```

This creates a 720p video at 1 Mbps bitrate.

## ✅ Verification Checklist

Before uploading:

- [ ] Video is compressed
- [ ] File size is < 4MB (check properties)
- [ ] Format is MP4
- [ ] Video plays correctly
- [ ] Quality is acceptable
- [ ] Audio is clear (if needed)

## 🎬 Recommended Video Length

For 4MB limit:

| Resolution | Bitrate | Max Duration |
|-----------|---------|--------------|
| 720p | 2 Mbps | ~15 seconds |
| 720p | 1.5 Mbps | ~20 seconds |
| 720p | 1 Mbps | ~30 seconds |
| 480p | 1 Mbps | ~30 seconds |

**Recommendation:** Keep product videos under 20 seconds for best results.

## 🆘 Still Too Large?

### Option 1: Further Compression
- Lower bitrate to 0.8 Mbps
- Reduce resolution to 480p
- Shorten video duration

### Option 2: Upload to YouTube
1. Upload video to YouTube
2. Set as unlisted
3. Get embed code
4. Use video URL in product instead

### Option 3: Use GIF
- Convert short clips to GIF
- Much smaller file size
- Good for product demos

### Option 4: Upgrade Vercel Plan
- Pro plan: 50MB limit
- Enterprise: 100MB limit
- Costs $20/month

## 📱 Mobile Recording Tips

If recording on phone:

1. **Settings → Camera:**
   - Resolution: 720p (not 4K)
   - Frame Rate: 30 fps (not 60)
   - Format: H.264 (not HEVC)

2. **Keep videos short:**
   - 10-15 seconds ideal
   - Focus on key features

3. **Good lighting:**
   - Better compression
   - Smaller file size

## 🎉 Success!

After compression:
- ✅ File size < 4MB
- ✅ Upload works smoothly
- ✅ Video plays on site
- ✅ Good quality maintained

---

**Remember:** Vercel free tier has a 4.5MB limit. Always compress videos before uploading!

**Quick Link:** https://www.freeconvert.com/video-compressor
