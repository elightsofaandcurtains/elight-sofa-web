                                        # 🔍 Login Debug Guide

## Step 1: Access Debug Page

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the debug page:
   ```
   http://localhost:3000/debug-auth
   ```

## Step 2: Check Console Logs

1. Open Developer Tools (F12)
2. Go to Console tab
3. Click "Test Login" on the debug page
4. Watch for these log messages:

### Expected Log Messages:

**If using Firebase:**
```
🔧 Firebase configuration check: {projectId: "elight-sofa", apiKey: "***", configured: true}
🔍 SignIn called with: {email: "admin@elightsofa.com", password: "***"}
🔥 Using Firebase authentication
🔥 AuthService.signIn called with: {email: "admin@elightsofa.com", password: "***"}
🔥 Attempting Firebase signInWithEmailAndPassword...
```

**If using Mock Authentication:**
```
🔧 Firebase configuration check: {projectId: "elight-sofa", apiKey: "***", configured: false}
🔍 SignIn called with: {email: "admin@elightsofa.com", password: "***"}
🎭 Using mock authentication
🔍 Looking for mock user: admin@elightsofa.com Found: true
✅ Mock authentication successful
💾 Saved to localStorage
```

## Step 3: Common Issues & Solutions

### Issue 1: Firebase Auth Error
**Symptoms:** Red error messages about Firebase
**Solution:** 
- Check if your Firebase project has Authentication enabled
- Verify Email/Password provider is enabled in Firebase Console
- Create the admin user in Firebase Console first

### Issue 2: Mock Auth Not Working
**Symptoms:** "Invalid email or password" with mock auth
**Solution:**
- Use exact credentials: `admin@elightsofa.com` / `admin123`
- Check browser console for detailed logs

### Issue 3: Page Redirects Immediately
**Symptoms:** Login page redirects without showing error
**Solution:**
- Check if you're already logged in
- Clear localStorage: Click "Clear Storage & Reload" on debug page

## Step 4: Manual Firebase User Creation

If Firebase is configured but no admin user exists:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `elight-sofa`
3. Go to Authentication > Users
4. Click "Add user"
5. Create user with:
   - Email: `admin@elightsofa.com`
   - Password: `admin123`

## Step 5: Test URLs

Try these URLs to test different parts:

- **Debug Page:** http://localhost:3000/debug-auth
- **Login Page:** http://localhost:3000/auth/login
- **Test Page:** http://localhost:3000/auth/test
- **Admin Panel:** http://localhost:3000/admin (after login)

## Step 6: Report Results

After testing, please share:

1. What you see on the debug page
2. Any console error messages (copy/paste)
3. Which authentication mode it's using (Firebase or Mock)
4. The exact error message you get when trying to login

This will help identify the exact issue!