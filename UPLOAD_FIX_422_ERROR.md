# Fix: Upload 422 Error - "File already exists"

## ✅ FIXED: Automatic Retry on File Conflicts

### What Was the Problem?
When uploading images/videos, you got this error:
```
❌ Upload API error: {status: 422, error: 'File already exists or invalid content'}
```

This happened because:
1. GitHub API won't overwrite existing files without the file's SHA hash
2. Our filename generator uses timestamp + random string
3. If you upload quickly or the random string collides, the file already exists
4. Previous code would just fail immediately

### What's Fixed?
Updated `src/app/api/upload/route.ts` to:
- **Automatically retry up to 5 times** with different filenames
- Add attempt number to filename on retries (e.g., `1234567-abc123-1.jpg`)
- Wait 100ms between retries
- Better error messages

### How It Works Now:

**Before (Failed):**
```
📁 Upload path: images/products/1234567-abc123.jpg
📡 GitHub API response: 422 Unprocessable Entity
❌ File already exists or invalid content
```

**After (Auto-Retry):**
```
📁 Upload attempt 1/5: images/products/1234567-abc123.jpg
📡 GitHub API response: 422 Unprocessable Entity
⚠️ File exists, retrying with new name...

📁 Upload attempt 2/5: images/products/1234567-abc123-1.jpg
📡 GitHub API response: 200 OK
✅ Upload successful: https://raw.githubusercontent.com/...
```

### Files Updated:
1. ✅ `src/app/api/upload/route.ts` - Server-side upload with retry logic
2. ✅ `src/lib/githubImageUpload.ts` - Client-side filename generator updated

### Test It:
1. **No need to restart server** - Next.js will auto-reload
2. Go to Admin → Products → Add Product
3. Upload the same image multiple times quickly
4. Should work without errors now
5. Check console - you'll see retry attempts if needed

### What You'll See in Console:

**Successful Upload (No Retry Needed):**
```
📤 Uploading file: {name: 'sofa.jpg', type: 'image/jpeg', size: '2.5 MB'}
🔄 Uploading via API route...
📁 Upload attempt 1/5: images/products/1737724878123-x7k9m2.jpg
📡 GitHub API response: 200 OK
✅ Upload successful: https://raw.githubusercontent.com/...
```

**Upload with Retry (File Existed):**
```
📤 Uploading file: {name: 'sofa.jpg', type: 'image/jpeg', size: '2.5 MB'}
🔄 Uploading via API route...
📁 Upload attempt 1/5: images/products/1737724878123-x7k9m2.jpg
📡 GitHub API response: 422 Unprocessable Entity
⚠️ File exists, retrying with new name...
📁 Upload attempt 2/5: images/products/1737724878123-x7k9m2-1.jpg
📡 GitHub API response: 200 OK
✅ Upload successful: https://raw.githubusercontent.com/...
```

### Edge Cases Handled:
- ✅ File name collision → Auto-retry with new name
- ✅ Multiple rapid uploads → Each gets unique name
- ✅ Max 5 attempts → Prevents infinite loops
- ✅ Other errors (401, 403, 404) → Fail immediately with clear message

### If Still Getting 422 After 5 Attempts:
This is extremely rare, but if it happens:
1. Wait 1-2 seconds
2. Try uploading again
3. The timestamp will be different, so it will work

### No Action Required:
The fix is automatic. Just upload files normally and the system will handle conflicts automatically.

---

## 🎯 Summary

**Problem:** Upload failed with 422 error when file already existed  
**Solution:** Automatic retry with different filename (up to 5 attempts)  
**Status:** ✅ Fixed and deployed  
**Action:** None - just upload normally, retries happen automatically
