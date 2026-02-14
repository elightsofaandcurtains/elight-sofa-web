# App Store Submission Guide
# Elight Sofa House - Android & iOS

## Prerequisites Checklist

- ✅ PWA working perfectly (Lighthouse score 100)
- ✅ All icons generated and tested
- ✅ App deployed to production (Vercel)
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Service worker registered
- ✅ Offline mode working
- ✅ No console errors
- ✅ Tested on real devices

---

# PHASE 1: Android App (Google Play Store)

## Step 1: Use PWABuilder

### 1.1 Validate PWA
```
1. Go to: https://www.pwabuilder.com/
2. Enter URL: https://elight-sofa-web.vercel.app
3. Click "Start"
4. Wait for analysis
```

### 1.2 Fix Any Warnings
Common issues:
- ❌ Service worker not found → Rebuild and redeploy
- ❌ Manifest missing → Check public/manifest.json
- ❌ Icons missing → Generate all required icons
- ❌ Not HTTPS → Deploy to Vercel (auto HTTPS)

### 1.3 Generate Android Package
```
1. Click "Package For Stores"
2. Select "Android"
3. Configure settings:
   - Package ID: com.elightsofa.house
   - App name: Elight Sofa House
   - Launcher name: Elight Sofa
   - Version: 1.0.0
   - Version code: 1
   - Host: elight-sofa-web.vercel.app
   - Start URL: /
```

### 1.4 Advanced Options
```
Display Mode: standalone
Orientation: portrait
Theme color: #D4AF37
Background color: #2D2926
Icon URL: /icons/icon-512x512.png
Maskable icon URL: /icons/icon-maskable-512x512.png
Shortcuts: Enable
Splash screens: Auto-generate
```

### 1.5 Signing Options
```
Option 1: Use PWABuilder signing (recommended for first time)
- Let PWABuilder generate signing key
- Download .aab file
- Download signing key (KEEP SAFE!)

Option 2: Use your own signing key
- Generate keystore with Android Studio
- Upload to PWABuilder
- Sign and download .aab
```

### 1.6 Download Package
```
1. Click "Generate"
2. Wait 2-3 minutes
3. Download .aab file
4. Download signing key (if new)
5. Download asset pack (optional)
```

---

## Step 2: Google Play Console Setup

### 2.1 Create Developer Account
```
1. Go to: https://play.google.com/console
2. Pay $25 one-time fee
3. Complete account setup
4. Verify identity
```

### 2.2 Create New App
```
1. Click "Create app"
2. App details:
   - App name: Elight Sofa House
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
3. Accept declarations
4. Click "Create app"
```

### 2.3 Set Up App Content

#### Store Listing
```
App name: Elight Sofa House
Short description (80 chars):
"Premium furniture & interiors. Browse luxury sofas, chairs, tables & curtains."

Full description (4000 chars):
"Elight Sofa House - Your destination for premium furniture and interior solutions.

🛋️ LUXURY FURNITURE COLLECTION
Browse our extensive collection of handcrafted sofas, elegant chairs, stylish tables, and premium bedroom furniture. Each piece is designed with attention to detail and crafted for lasting comfort.

🎨 CUSTOM CURTAINS & INTERIORS
Transform your space with our custom-made curtains and interior design solutions. Choose from a wide range of fabrics, patterns, and styles tailored to your vision.

✨ WHY CHOOSE US
• Premium quality materials
• Expert craftsmanship since 2015
• Custom design services
• Competitive pricing
• Fast delivery across Surat
• Professional installation

📱 APP FEATURES
• Browse complete furniture catalog
• View detailed product specifications
• Send instant inquiries
• Save favorite items
• Contact us directly
• Offline browsing support

🏆 TRUSTED BY THOUSANDS
Serving customers across Surat, Gujarat since 2015. Experience the perfect blend of traditional craftsmanship and modern design.

📍 VISIT OUR SHOWROOM
1/2, Shanti and Soc, Dabholi Rd, Katargam, Surat, Gujarat 395004

📞 CONTACT US
Phone: +91 9714392926
Email: elightsofaandcurtains@gmail.com

Download now and discover your perfect furniture!"

App icon: Upload 512x512 PNG
Feature graphic: 1024x500 PNG
Phone screenshots: 2-8 images (1080x1920 or 1080x2340)
Tablet screenshots: Optional
```

#### Categorization
```
App category: Shopping
Tags: furniture, home decor, interior design, shopping
```

#### Contact Details
```
Email: elightsofaandcurtains@gmail.com
Phone: +91 9714392926
Website: https://elight-sofa-web.vercel.app
```

#### Privacy Policy
```
URL: https://elight-sofa-web.vercel.app/privacy-policy
(Create this page on your website)
```

### 2.4 App Access
```
All or some functionality is restricted: No
Special access: None required
```

### 2.5 Ads
```
Contains ads: No
```

### 2.6 Content Rating
```
1. Start questionnaire
2. Select category: Shopping
3. Answer questions:
   - Violence: No
   - Sexual content: No
   - Profanity: No
   - Controlled substances: No
   - User interaction: Yes (contact forms)
   - Shares location: No
   - Shares personal info: Yes (inquiry forms)
4. Get rating (likely: Everyone)
5. Apply rating
```

### 2.7 Target Audience
```
Target age: 18+
```

### 2.8 News App
```
Is this a news app: No
```

### 2.9 COVID-19 Contact Tracing
```
Is this a contact tracing app: No
```

### 2.10 Data Safety
```
Data collection:
- Personal info: Yes (name, email, phone for inquiries)
- Location: No
- Financial info: No
- Photos: No
- Files: No

Data usage:
- App functionality: Yes
- Analytics: No
- Advertising: No
- Fraud prevention: No

Data sharing:
- Third parties: No

Data security:
- Data encrypted in transit: Yes (HTTPS)
- Users can request deletion: Yes
- Committed to Google Play Families Policy: No
```

---

## Step 3: Upload App Bundle

### 3.1 Production Track
```
1. Go to "Production" in left menu
2. Click "Create new release"
3. Upload .aab file from PWABuilder
4. Release name: 1.0.0
5. Release notes:
   "Initial release
   • Browse premium furniture collection
   • Send product inquiries
   • View detailed specifications
   • Contact showroom
   • Offline support"
6. Click "Save"
```

### 3.2 Review and Rollout
```
1. Review all sections (must be complete)
2. Click "Send for review"
3. Wait 1-7 days for approval
4. App goes live automatically after approval
```

---

## Step 4: Required Assets

### Screenshots (Phone)
Capture these screens:
1. Home page
2. Shop/Collections page
3. Product detail page
4. Inquiry form
5. Contact page

Requirements:
- Format: PNG or JPEG
- Dimensions: 1080x1920 or 1080x2340
- Min: 2 screenshots
- Max: 8 screenshots

### Feature Graphic
- Dimensions: 1024x500
- Format: PNG or JPEG
- Content: App name + tagline + key visual

### App Icon
- Dimensions: 512x512
- Format: PNG (32-bit)
- No transparency
- No rounded corners (Google adds them)

---

# PHASE 2: iOS App (Apple App Store)

## Step 1: Use PWABuilder iOS Package

### 1.1 Generate iOS Package
```
1. Go to: https://www.pwabuilder.com/
2. Enter URL: https://elight-sofa-web.vercel.app
3. Click "Package For Stores"
4. Select "iOS"
5. Configure:
   - Bundle ID: com.elightsofa.house
   - App name: Elight Sofa House
   - Version: 1.0.0
6. Download package
```

### 1.2 What You Get
```
- Xcode project
- Swift code
- WKWebView configuration
- App icons configured
- Launch screen
- Info.plist configured
```

---

## Step 2: Apple Developer Account

### 2.1 Enroll
```
1. Go to: https://developer.apple.com/programs/
2. Pay $99/year
3. Complete enrollment
4. Wait for approval (1-2 days)
```

### 2.2 Certificates & Identifiers
```
1. Go to: https://developer.apple.com/account/
2. Certificates, Identifiers & Profiles
3. Create App ID:
   - Description: Elight Sofa House
   - Bundle ID: com.elightsofa.house
   - Capabilities: None required
4. Create Distribution Certificate
5. Create Provisioning Profile
```

---

## Step 3: Xcode Setup

### 3.1 Open Project
```
1. Extract PWABuilder iOS package
2. Open .xcodeproj in Xcode
3. Select your team
4. Update Bundle ID: com.elightsofa.house
```

### 3.2 Configure App
```
General tab:
- Display Name: Elight Sofa House
- Bundle Identifier: com.elightsofa.house
- Version: 1.0.0
- Build: 1

Signing & Capabilities:
- Team: Your team
- Signing Certificate: Distribution
- Provisioning Profile: App Store

Info tab:
- Privacy - Camera Usage: Not required
- Privacy - Location: Not required
- App Transport Security: Allow HTTPS only
```

### 3.3 Build Archive
```
1. Select "Any iOS Device" as target
2. Product > Archive
3. Wait for build
4. Click "Distribute App"
5. Select "App Store Connect"
6. Upload to App Store
```

---

## Step 4: App Store Connect

### 4.1 Create App
```
1. Go to: https://appstoreconnect.apple.com/
2. My Apps > + > New App
3. Platforms: iOS
4. Name: Elight Sofa House
5. Primary Language: English (U.S.)
6. Bundle ID: com.elightsofa.house
7. SKU: elightsofa001
8. User Access: Full Access
```

### 4.2 App Information
```
Name: Elight Sofa House
Subtitle: Premium Furniture & Interiors
Category: Shopping
Secondary Category: Lifestyle

Privacy Policy URL: https://elight-sofa-web.vercel.app/privacy-policy
```

### 4.3 Pricing
```
Price: Free
Availability: All countries
```

### 4.4 App Privacy
```
Data collection:
- Contact Info: Yes (name, email, phone)
- User Content: No
- Identifiers: No
- Usage Data: No
- Diagnostics: No

Purpose:
- App Functionality
- Customer Support

Linked to user: No
Used for tracking: No
```

### 4.5 Prepare for Submission
```
Screenshots (iPhone 6.7"):
- 1290x2796 pixels
- 2-10 screenshots
- Capture: Home, Shop, Product, Inquiry, Contact

Screenshots (iPhone 6.5"):
- 1242x2688 pixels
- Same screens

Screenshots (iPhone 5.5"):
- 1242x2208 pixels
- Same screens

App Preview (optional):
- 30 second video
- Show key features
```

### 4.6 Description
```
Promotional Text (170 chars):
"Browse premium furniture, send inquiries, and transform your space with Elight Sofa House."

Description (4000 chars):
[Same as Android description]

Keywords (100 chars):
"furniture,sofa,chair,table,curtain,interior,design,luxury,home,decor"

Support URL: https://elight-sofa-web.vercel.app/contact
Marketing URL: https://elight-sofa-web.vercel.app
```

### 4.7 Build
```
1. Select uploaded build
2. Export Compliance: No encryption
3. Advertising Identifier: No
```

### 4.8 Submit for Review
```
1. Review all sections
2. Add for Review
3. Submit
4. Wait 1-3 days for review
5. App goes live after approval
```

---

## Required Assets Summary

### Android
- ✅ App icon: 512x512 PNG
- ✅ Feature graphic: 1024x500 PNG
- ✅ Phone screenshots: 1080x1920 (2-8 images)
- ✅ Privacy policy URL
- ✅ .aab file

### iOS
- ✅ App icon: 1024x1024 PNG
- ✅ iPhone 6.7" screenshots: 1290x2796 (2-10 images)
- ✅ iPhone 6.5" screenshots: 1242x2688 (2-10 images)
- ✅ iPhone 5.5" screenshots: 1242x2208 (2-10 images)
- ✅ Privacy policy URL
- ✅ Xcode archive

---

## Privacy Policy Template

Create page at: `/privacy-policy`

```markdown
# Privacy Policy - Elight Sofa House

Last updated: [DATE]

## Information We Collect
- Name, email, phone number (when you submit inquiries)
- Product preferences
- No location data
- No payment information

## How We Use Information
- Respond to your inquiries
- Provide customer support
- Improve our services

## Data Security
- All data transmitted via HTTPS
- Stored securely on Firebase
- Not shared with third parties

## Your Rights
- Request data deletion
- Access your data
- Opt-out of communications

## Contact
Email: elightsofaandcurtains@gmail.com
Phone: +91 9714392926
```

---

## Timeline

### Android
- PWA validation: 10 minutes
- Package generation: 5 minutes
- Play Console setup: 1 hour
- Review: 1-7 days
- **Total: 1-7 days**

### iOS
- Package generation: 10 minutes
- Xcode setup: 30 minutes
- App Store Connect: 1 hour
- Review: 1-3 days
- **Total: 1-3 days**

---

## Costs

- Google Play: $25 (one-time)
- Apple Developer: $99/year
- **Total first year: $124**

---

## Post-Launch

### Monitor
- Download stats
- Crash reports
- User reviews
- Ratings

### Update Process
1. Fix bugs/add features
2. Increment version (1.0.1, 1.0.2, etc.)
3. Build new package
4. Upload to stores
5. Submit for review

### Maintenance
- Respond to reviews
- Fix reported issues
- Update content
- Add new features

---

## Support Resources

- PWABuilder: https://www.pwabuilder.com/
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com/
- PWABuilder Discord: https://aka.ms/pwabuilderdiscord
