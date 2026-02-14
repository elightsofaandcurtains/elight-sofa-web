# Final PWA to Mobile App Checklist
# Elight Sofa House

## Phase 1: PWA Setup ✅

### Dependencies
- [ ] Run: `npm install next-pwa`
- [ ] Verify next.config.js updated with PWA config
- [ ] Check package.json has next-pwa dependency

### Configuration Files
- [ ] ✅ next.config.js (PWA configuration)
- [ ] ✅ public/manifest.json (Web App Manifest)
- [ ] ✅ public/offline.html (Offline fallback page)
- [ ] ✅ public/browserconfig.xml (Windows tiles)
- [ ] ✅ public/robots.txt (SEO)
- [ ] ✅ src/app/layout.tsx (Meta tags)

### Icons (Generate using PWABuilder or RealFaviconGenerator)
- [ ] public/icons/icon-72x72.png
- [ ] public/icons/icon-96x96.png
- [ ] public/icons/icon-128x128.png
- [ ] public/icons/icon-144x144.png
- [ ] public/icons/icon-152x152.png
- [ ] public/icons/icon-192x192.png
- [ ] public/icons/icon-384x384.png
- [ ] public/icons/icon-512x512.png
- [ ] public/icons/icon-maskable-512x512.png
- [ ] public/icons/apple-touch-icon.png (180x180)
- [ ] public/icons/favicon-32x32.png
- [ ] public/icons/favicon-16x16.png
- [ ] public/favicon.ico

### Apple Splash Screens (Optional but recommended)
- [ ] public/icons/apple-splash-2048-2732.png
- [ ] public/icons/apple-splash-1668-2388.png
- [ ] public/icons/apple-splash-1536-2048.png
- [ ] public/icons/apple-splash-1125-2436.png
- [ ] public/icons/apple-splash-1242-2688.png
- [ ] public/icons/apple-splash-750-1334.png
- [ ] public/icons/apple-splash-640-1136.png

### Shortcut Icons
- [ ] public/icons/shortcut-shop.png (96x96)
- [ ] public/icons/shortcut-inquiry.png (96x96)
- [ ] public/icons/shortcut-contact.png (96x96)

---

## Phase 2: Build & Test 🧪

### Local Testing
- [ ] Run: `npm install`
- [ ] Run: `npm run build`
- [ ] Run: `npm start`
- [ ] Open: http://localhost:3000
- [ ] Open Chrome DevTools > Application
- [ ] Check "Manifest" tab - all icons load
- [ ] Check "Service Workers" tab - worker registered
- [ ] Check "Storage" - cache populated

### Lighthouse Audit
- [ ] Open Chrome DevTools > Lighthouse
- [ ] Select "Progressive Web App"
- [ ] Run audit
- [ ] Score should be 100/100
- [ ] Fix any issues
- [ ] Re-run until 100

### Installation Test (Desktop)
- [ ] Look for install icon in Chrome address bar
- [ ] Click "Install Elight Sofa House"
- [ ] App opens in standalone window
- [ ] No browser UI visible
- [ ] App icon in taskbar/dock

### Offline Test
- [ ] Open app
- [ ] Turn off internet
- [ ] Navigate to different pages
- [ ] Should show offline.html for new pages
- [ ] Previously visited pages should load from cache
- [ ] Turn internet back on
- [ ] App should sync automatically

---

## Phase 3: Deploy to Production 🚀

### Vercel Deployment
- [ ] Push code to GitHub
- [ ] Vercel auto-deploys
- [ ] Wait for deployment to complete
- [ ] Visit: https://elight-sofa-web.vercel.app
- [ ] Verify PWA works on production

### Production Testing
- [ ] Test on real Android device (Chrome)
- [ ] Test on real iPhone (Safari)
- [ ] Test "Add to Home Screen" on both
- [ ] Test offline mode on both
- [ ] Test all features work

---

## Phase 4: Android App 📱

### PWABuilder
- [ ] Go to: https://www.pwabuilder.com/
- [ ] Enter URL: https://elight-sofa-web.vercel.app
- [ ] Click "Start"
- [ ] Fix any warnings
- [ ] Click "Package For Stores"
- [ ] Select "Android"
- [ ] Configure package settings
- [ ] Download .aab file
- [ ] Download signing key (KEEP SAFE!)

### Google Play Console
- [ ] Create developer account ($25)
- [ ] Create new app
- [ ] Complete store listing
- [ ] Upload screenshots (1080x1920)
- [ ] Upload feature graphic (1024x500)
- [ ] Set content rating
- [ ] Complete data safety form
- [ ] Upload .aab file
- [ ] Submit for review

### Required Assets
- [ ] App icon: 512x512 PNG
- [ ] Feature graphic: 1024x500 PNG
- [ ] Phone screenshots: 2-8 images
- [ ] Privacy policy URL
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)

---

## Phase 5: iOS App 🍎

### PWABuilder iOS
- [ ] Go to: https://www.pwabuilder.com/
- [ ] Enter URL: https://elight-sofa-web.vercel.app
- [ ] Click "Package For Stores"
- [ ] Select "iOS"
- [ ] Download Xcode project

### Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID: com.elightsofa.house
- [ ] Create certificates
- [ ] Create provisioning profile

### Xcode
- [ ] Open downloaded project
- [ ] Select your team
- [ ] Update Bundle ID
- [ ] Build archive
- [ ] Upload to App Store Connect

### App Store Connect
- [ ] Create new app
- [ ] Complete app information
- [ ] Upload screenshots (1290x2796, 1242x2688, 1242x2208)
- [ ] Set pricing (Free)
- [ ] Complete privacy section
- [ ] Select build
- [ ] Submit for review

### Required Assets
- [ ] App icon: 1024x1024 PNG
- [ ] iPhone 6.7" screenshots: 2-10 images
- [ ] iPhone 6.5" screenshots: 2-10 images
- [ ] iPhone 5.5" screenshots: 2-10 images
- [ ] Privacy policy URL
- [ ] Description (4000 chars)
- [ ] Keywords (100 chars)

---

## Phase 6: Additional Pages 📄

### Privacy Policy
- [ ] Create page: /privacy-policy
- [ ] Add content (see STORE_SUBMISSION_GUIDE.md)
- [ ] Deploy to production
- [ ] Test URL works

### Terms of Service (Optional)
- [ ] Create page: /terms
- [ ] Add content
- [ ] Deploy

---

## Phase 7: Post-Launch 🎉

### Monitor
- [ ] Check Google Play Console daily
- [ ] Check App Store Connect daily
- [ ] Respond to user reviews
- [ ] Monitor crash reports
- [ ] Track download stats

### Updates
- [ ] Fix bugs as reported
- [ ] Add new features
- [ ] Increment version number
- [ ] Build new packages
- [ ] Upload to stores
- [ ] Submit for review

---

## Commands Reference

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start

# PWA build and test
npm run pwa:build

# Analyze PWA
npm run pwa:analyze
# Then open http://localhost:3000 and run Lighthouse

# Deploy to Vercel
git add .
git commit -m "PWA setup complete"
git push origin main
```

---

## Troubleshooting

### Service Worker Not Registering
```bash
# Clear .next folder
rm -rf .next

# Rebuild
npm run build
npm start

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Icons Not Showing
- Check file paths in manifest.json
- Verify files exist in public/icons/
- Clear browser cache
- Check browser console for 404 errors

### Lighthouse Score < 100
- Check all icons are present
- Verify service worker is registered
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Fix any console errors

### App Not Installable
- Must be HTTPS (Vercel auto)
- Must have manifest.json
- Must have service worker
- Must have 192x192 and 512x512 icons
- Check Chrome DevTools > Application > Manifest

---

## Success Criteria

### PWA
- ✅ Lighthouse PWA score: 100/100
- ✅ Installable on Chrome (desktop & mobile)
- ✅ Installable on Safari (iOS)
- ✅ Works offline
- ✅ No console errors
- ✅ Service worker active
- ✅ All icons load correctly

### Android
- ✅ .aab file generated
- ✅ Uploaded to Play Console
- ✅ All store listing complete
- ✅ Submitted for review
- ✅ App approved and live

### iOS
- ✅ Xcode project builds
- ✅ Uploaded to App Store Connect
- ✅ All app information complete
- ✅ Submitted for review
- ✅ App approved and live

---

## Timeline Estimate

- PWA Setup: 2-4 hours
- Icon Generation: 1-2 hours
- Testing: 1-2 hours
- Android Submission: 2-3 hours
- iOS Submission: 3-4 hours
- Review Wait: 1-7 days (Android), 1-3 days (iOS)

**Total: 1-2 weeks from start to live on both stores**

---

## Support

- PWABuilder: https://www.pwabuilder.com/
- PWABuilder Discord: https://aka.ms/pwabuilderdiscord
- Next.js PWA: https://github.com/shadowwalker/next-pwa
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com/

---

## Next Steps

1. ✅ Install next-pwa: `npm install next-pwa`
2. ✅ Generate all icons (use PWABuilder Image Generator)
3. ✅ Build and test locally
4. ✅ Deploy to Vercel
5. ✅ Test on real devices
6. ✅ Run Lighthouse audit (score 100)
7. ✅ Generate Android package (PWABuilder)
8. ✅ Submit to Google Play
9. ✅ Generate iOS package (PWABuilder)
10. ✅ Submit to App Store

**You're ready to start! Begin with: `npm install next-pwa`**
