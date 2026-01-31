# Media Order & Per-Foot Pricing Debug Guide

## ✅ Status: Code is Correct, GitHub Token is Valid

Your code implementation is correct and the GitHub token is working. If you're still experiencing issues, follow this debugging guide.

---

## 🔍 Issue 1: Media Order Not Preserved

### What Should Happen:
1. Upload images/videos in Add Product modal
2. Drag to reorder them
3. First item becomes the main display image
4. Order is preserved when viewing the product

### Debug Steps:

#### Step 1: Open Browser Console (F12)
Before adding a product, open the browser developer console to see debug logs.

#### Step 2: Add Product with Media
1. Go to Admin → Products → Add Product
2. Select a category (e.g., Sofas)
3. Upload 2-3 images and 1 video
4. **Drag them to reorder** - watch console for:
   ```
   Updating form media values: {
     mediaOrder: [{url: "...", type: "image"}, ...],
     imageUrls: ["...", "..."],
     videoUrls: ["..."]
   }
   ```

#### Step 3: Submit Form
Click "Add Product" and watch console for:
```
Form data being submitted: {
  sofaSize: "...",
  sofaFootPrice: ...,
  mediaOrder: [...],
  imageUrls: [...],
  videoUrls: [...]
}

🔥 Creating product - Full incoming data: {...}
🔥 Creating product - Key fields: {
  mediaOrder: [...],
  mediaOrderLength: 3,
  ...
}

✅ Product created with ID: xxx
```

#### Step 4: View Product
Navigate to the product detail page and check console:
```
📦 mapDocToProduct - Raw Firebase data: {
  id: "xxx",
  mediaOrder: [...],
  sofaSize: "...",
  sofaFootPrice: ...
}

ProductImageGallery received: {
  productName: "...",
  mediaOrder: [...],
  mediaOrderLength: 3
}

Using mediaOrder for gallery: [...]
```

### ✅ If Logs Show Correct Data:
- Clear browser cache: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Try in incognito/private window
- Check if you're viewing an old product (create a new test product)

### ❌ If mediaOrder is Empty in Logs:
This means the drag-and-drop isn't updating the form. Try:
1. Refresh the page
2. Clear browser cache
3. Check if JavaScript errors appear in console

---

## 🔍 Issue 2: Per-Foot Pricing Not Showing

### What Should Happen:
For Sofa products:
1. Enter Size: `8ft` or `8 x 6 ft`
2. Enter ₹ per Foot: `3000`
3. Calculated Price shows: `₹24,000 (8 ft)` or `₹144,000 (48 ft)`
4. Click "Apply Calculated Price" to set the product price
5. On product detail page, see amber box with:
   - Size: 8ft
   - Rate per Foot: ₹3,000/ft
   - Total Price: ₹24,000

### Debug Steps:

#### Step 1: Add Sofa Product
1. Select category: **Sofas**
2. Scroll to "Per-Foot Pricing" section (amber box)
3. Enter Size: `10ft`
4. Enter ₹ per Foot: `2500`
5. Watch "Calculated Price" field - should show `₹25,000 (10 ft)`
6. Click "Apply Calculated Price"
7. Check that "Price (₹)" field now shows `25000`

#### Step 2: Save and Check Console
After saving, check console for:
```
Form data being submitted: {
  sofaSize: "10ft",
  sofaFootPrice: 2500,
  price: 25000,
  ...
}

🔥 Creating product - Key fields: {
  sofaSize: "10ft",
  sofaFootPrice: 2500,
  ...
}
```

#### Step 3: View Product Detail Page
Navigate to product and check:
1. Console should show:
   ```
   📦 mapDocToProduct - Raw Firebase data: {
     sofaSize: "10ft",
     sofaFootPrice: 2500,
     ...
   }
   ```
2. Page should display amber gradient box with size/rate/total

### ❌ If Not Showing:
- Make sure you're viewing a **Sofa** product (not Chair/Table/etc.)
- Check if `sofaSize` and `sofaFootPrice` are in the console logs
- Hard refresh the page: `Ctrl + Shift + R`

---

## 🔍 Issue 3: File Upload Errors

### GitHub Token Test:
Run this command to verify your token:
```cmd
node scripts/test-github-token.js
```

Should show:
```
✅ Token is VALID!
✅ You can upload images/videos to this repository.
```

### If Token Invalid:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: `Elight Sofa Upload`
4. Select scope: ✅ **repo** (full control)
5. Click "Generate token"
6. Copy the token (starts with `ghp_` or `github_pat_`)
7. Update `.env.local`:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_new_token_here
   ```
8. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev`

### File Size Limits:
- **No limits** on client side (removed)
- GitHub API limit: **100MB per file**
- If file > 100MB, GitHub will reject it

### Upload Debug:
Watch console during upload:
```
📤 Uploading file: {
  name: "sofa.jpg",
  type: "image/jpeg",
  size: "2.5 MB",
  isVideo: false
}

🔄 Uploading via API route...
✅ Upload successful: https://raw.githubusercontent.com/...
```

---

## 🚀 Quick Test Checklist

### Test Media Order:
- [ ] Open browser console (F12)
- [ ] Add product with 3+ images/videos
- [ ] Drag to reorder
- [ ] Check console for "Updating form media values"
- [ ] Save product
- [ ] Check console for "🔥 Creating product - Key fields"
- [ ] View product
- [ ] Check console for "ProductImageGallery received"
- [ ] Verify first media item is displayed as main image

### Test Per-Foot Pricing:
- [ ] Add Sofa product
- [ ] Enter Size: `8ft`
- [ ] Enter ₹ per Foot: `3000`
- [ ] Verify Calculated Price shows `₹24,000 (8 ft)`
- [ ] Click "Apply Calculated Price"
- [ ] Save product
- [ ] View product detail page
- [ ] Verify amber box shows size/rate/total

### Test File Upload:
- [ ] Run `node scripts/test-github-token.js`
- [ ] Verify token is valid
- [ ] Upload an image (< 10MB)
- [ ] Check console for upload progress
- [ ] Verify image appears in preview
- [ ] Upload a video (< 50MB)
- [ ] Verify video appears with purple badge

---

## 📝 Common Issues & Solutions

### Issue: "Media order changes but reverts after save"
**Solution:** This means data isn't reaching Firebase. Check:
1. Console logs show `mediaOrder` in "Creating product" log
2. Firestore rules allow writes (they do - checked)
3. No JavaScript errors in console

### Issue: "Per-foot pricing not calculating"
**Solution:** Check:
1. Size format is correct: `8ft` or `8 x 6 ft` (not `8 feet`)
2. Price per foot is a number (not empty)
3. Category is "Sofas" (not other categories)

### Issue: "Upload fails with 401/403 error"
**Solution:**
1. Token expired - regenerate at https://github.com/settings/tokens
2. Token lacks permissions - ensure "repo" scope is checked
3. Update `.env.local` and restart server

### Issue: "Video not playing"
**Solution:**
1. Check video format (MP4, WEBM, MOV supported)
2. Check file size (< 100MB)
3. Click play button in gallery
4. Check browser console for errors

---

## 🎯 Next Steps

1. **Test with fresh product**: Create a brand new product with the steps above
2. **Watch console logs**: Keep F12 open during the entire process
3. **Share console output**: If still not working, copy the console logs and share them
4. **Check Firestore**: Go to Firebase Console → Firestore → products collection → check if `mediaOrder`, `sofaSize`, `sofaFootPrice` fields exist

---

## 📞 Need Help?

If you've followed all steps and it's still not working:
1. Take screenshots of console logs
2. Note which step fails
3. Check if any JavaScript errors appear in console
4. Verify you're testing with a **new** product (not an old one)
