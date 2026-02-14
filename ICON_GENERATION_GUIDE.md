# Icon Generation Guide for Elight Sofa House PWA

## Required Icons

### Standard Icons (PNG)
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

### Special Icons
- ✅ icon-maskable-512x512.png (with safe zone)
- ✅ apple-touch-icon.png (180x180)
- ✅ favicon-32x32.png
- ✅ favicon-16x16.png
- ✅ favicon.ico
- ✅ safari-pinned-tab.svg (monochrome)

### Apple Splash Screens
- ✅ apple-splash-2048-2732.png (iPad Pro 12.9")
- ✅ apple-splash-1668-2388.png (iPad Pro 11")
- ✅ apple-splash-1536-2048.png (iPad)
- ✅ apple-splash-1125-2436.png (iPhone X/XS/11 Pro)
- ✅ apple-splash-1242-2688.png (iPhone XS Max/11 Pro Max)
- ✅ apple-splash-750-1334.png (iPhone 8)
- ✅ apple-splash-640-1136.png (iPhone SE)

### Shortcut Icons (96x96)
- ✅ shortcut-shop.png
- ✅ shortcut-inquiry.png
- ✅ shortcut-contact.png

---

## Method 1: Use PWA Builder Image Generator (RECOMMENDED)

### Step 1: Prepare Your Logo
1. Create a 512x512px PNG logo
2. Use transparent background
3. Keep important content in center 80% (safe zone for maskable)
4. Use your brand colors: Gold (#D4AF37) and Dark Brown (#2D2926)

### Step 2: Generate Icons
1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload your 512x512 logo
3. Select "Generate All Sizes"
4. Select "Include iOS Splash Screens"
5. Select "Include Maskable Icon"
6. Download ZIP file

### Step 3: Extract and Organize
```bash
# Extract downloaded ZIP
unzip pwa-icons.zip

# Move to your project
mv icons/* public/icons/
```

---

## Method 2: Use RealFaviconGenerator

### Step 1: Visit Generator
Go to: https://realfavicongenerator.net/

### Step 2: Upload Logo
- Upload your 512x512 logo
- Configure each platform:
  - **iOS**: Select "Add a solid, plain background color" → #2D2926
  - **Android**: Select "Use a distinct picture for Android" → Upload maskable version
  - **Windows**: Select tile color → #D4AF37
  - **macOS Safari**: Select theme color → #D4AF37

### Step 3: Generate and Download
- Click "Generate your Favicons and HTML code"
- Download package
- Extract to `public/icons/`

---

## Method 3: Manual Creation (Photoshop/Figma)

### Photoshop Steps
```
1. Open 512x512 logo
2. Image > Image Size
3. Set dimensions for each size
4. File > Export > Save for Web (PNG-24)
5. Repeat for all sizes
```

### Figma Steps
```
1. Create frames for each size
2. Place logo in center
3. Export as PNG 2x
4. Use "Export" panel for batch export
```

---

## Maskable Icon Requirements

### Safe Zone
- Total size: 512x512px
- Safe zone: 410x410px (80% of total)
- Minimum safe zone: 320x320px (62.5%)

### Design Tips
1. Add padding around logo
2. Use solid background color (#2D2926)
3. Keep logo centered
4. Test with: https://maskable.app/

### Example Structure
```
┌─────────────────────────┐
│  Padding (51px)         │
│  ┌─────────────────┐    │
│  │                 │    │
│  │   Logo (410px)  │    │
│  │                 │    │
│  └─────────────────┘    │
│  Padding (51px)         │
└─────────────────────────┘
```

---

## Apple Splash Screen Generation

### Online Tool (EASIEST)
1. Go to: https://appsco.pe/developer/splash-screens
2. Upload your logo
3. Select background color: #2D2926
4. Download all sizes
5. Move to `public/icons/`

### Manual Creation
Use these exact dimensions:
```
iPhone SE: 640x1136
iPhone 8: 750x1334
iPhone X: 1125x2436
iPhone XS Max: 1242x2688
iPad: 1536x2048
iPad Pro 11": 1668x2388
iPad Pro 12.9": 2048x2732
```

---

## Shortcut Icons

### Design Requirements
- Size: 96x96px
- Style: Simple, recognizable
- Colors: Match brand (Gold #D4AF37)

### Suggested Icons
1. **Shop**: Shopping bag icon
2. **Inquiry**: Message/chat icon
3. **Contact**: Phone/location icon

### Quick Creation
Use: https://www.flaticon.com/
1. Search for icon
2. Download 96x96 PNG
3. Recolor to #D4AF37
4. Save to `public/icons/`

---

## Folder Structure

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── icon-maskable-512x512.png
│   ├── apple-touch-icon.png
│   ├── apple-splash-2048-2732.png
│   ├── apple-splash-1668-2388.png
│   ├── apple-splash-1536-2048.png
│   ├── apple-splash-1125-2436.png
│   ├── apple-splash-1242-2688.png
│   ├── apple-splash-750-1334.png
│   ├── apple-splash-640-1136.png
│   ├── favicon-32x32.png
│   ├── favicon-16x16.png
│   ├── safari-pinned-tab.svg
│   ├── shortcut-shop.png
│   ├── shortcut-inquiry.png
│   └── shortcut-contact.png
├── favicon.ico
└── manifest.json
```

---

## Validation

### Test Maskable Icon
1. Go to: https://maskable.app/
2. Upload your maskable icon
3. Check all shapes (circle, squircle, rounded square)
4. Ensure logo is visible in all shapes

### Test All Icons
1. Build your app: `npm run build`
2. Start server: `npm start`
3. Open DevTools > Application > Manifest
4. Check all icons load correctly
5. No 404 errors

### Test on Real Devices
1. Deploy to Vercel
2. Open on iPhone (Safari)
3. Add to Home Screen
4. Check icon and splash screen
5. Repeat on Android (Chrome)

---

## Quick Commands

```bash
# Create icons directory
mkdir -p public/icons

# Download from PWA Builder
# (manual download from website)

# Or use CLI tool (if available)
npx pwa-asset-generator public/logo.png public/icons

# Verify all icons exist
ls -la public/icons/

# Check file sizes
du -sh public/icons/*
```

---

## Troubleshooting

### Icons Not Showing
- Clear browser cache
- Check file paths in manifest.json
- Verify files exist in public/icons/
- Check file permissions

### Maskable Icon Cropped
- Increase padding
- Use safe zone guide
- Test on https://maskable.app/

### Splash Screen Not Working (iOS)
- Check exact dimensions
- Verify media queries in layout.tsx
- Test on real device (simulator may not show)

---

## Next Steps

After generating all icons:
1. ✅ Place in `public/icons/`
2. ✅ Verify manifest.json paths
3. ✅ Test locally
4. ✅ Deploy to Vercel
5. ✅ Test on real devices
6. ✅ Run Lighthouse audit
