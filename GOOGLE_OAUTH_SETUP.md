# 🔐 Google OAuth Configuration Guide

**Date**: October 23, 2025  
**Reason**: Previous OAuth account was suspended  
**Action Required**: Create new OAuth 2.0 Client ID

---

## 📋 Step-by-Step Setup

### 1. Create New Google Cloud Project (If Needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "NEW PROJECT"
3. Project Name: `HUMBUG Quiz`
4. Click "CREATE"
5. Wait for project creation (takes ~30 seconds)

### 2. Enable Google+ API (Required for OAuth)

1. In Google Cloud Console, select your project
2. Navigate to: **APIs & Services** → **Library**
3. Search for: "Google+ API"
4. Click on "Google+ API"
5. Click "ENABLE"

### 3. Configure OAuth Consent Screen

1. Navigate to: **APIs & Services** → **OAuth consent screen**
2. User Type: Select **External** (unless you have Google Workspace)
3. Click "CREATE"

**App Information:**

- App name: `HUMBUG Quiz`
- User support email: `your-email@gmail.com` (or humbug@humbug.hu)
- App logo: (Optional - upload HUMBUG logo if available)

**App domain:**

- Application home page: `https://humbug.hu`
- Application privacy policy: `https://humbug.hu` (or specific privacy page URL)
- Application terms of service: `https://humbug.hu` (optional)

**Authorized domains:**

```
humbug.hu
vercel.app
```

**Developer contact information:**

- Email: `your-email@gmail.com`

4. Click "SAVE AND CONTINUE"

**Scopes:**

- Click "ADD OR REMOVE SCOPES"
- Select these scopes:
  - `openid`
  - `email`
  - `profile`
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Click "UPDATE"
- Click "SAVE AND CONTINUE"

**Test users:** (Optional for development)

- Add your test Google accounts
- Click "SAVE AND CONTINUE"

5. Review summary and click "BACK TO DASHBOARD"

### 4. Create OAuth 2.0 Client ID ⭐

1. Navigate to: **APIs & Services** → **Credentials**
2. Click "+ CREATE CREDENTIALS" → **OAuth client ID**
3. Application type: **Web application**
4. Name: `HUMBUG Quiz - Production`

---

## 🌐 COPY THESE EXACT VALUES

### ✅ Authorized JavaScript Origins

**Copy and paste these 3 URIs:**

```
https://humbug.hu
https://humbug-quiz.vercel.app
http://localhost:5000
```

**How to add:**

1. Click "ADD URI" button
2. Paste first URI: `https://humbug.hu`
3. Click "ADD URI" again
4. Paste second URI: `https://humbug-quiz.vercel.app`
5. Click "ADD URI" again
6. Paste third URI: `http://localhost:5000`

---

### ✅ Authorized Redirect URIs

**Copy and paste these 3 URIs:**

```
https://humbug.hu/api/auth/callback
https://humbug-quiz.vercel.app/api/auth/callback
http://localhost:5000/api/auth/callback
```

**How to add:**

1. Click "ADD URI" button under "Authorized redirect URIs"
2. Paste first URI: `https://humbug.hu/api/auth/callback`
3. Click "ADD URI" again
4. Paste second URI: `https://humbug-quiz.vercel.app/api/auth/callback`
5. Click "ADD URI" again
6. Paste third URI: `http://localhost:5000/api/auth/callback`

---

### 5. Save and Get Credentials

1. Click "CREATE" button
2. A popup will appear with:
   - **Your Client ID**: `xxxx-xxxx.apps.googleusercontent.com`
   - **Your Client Secret**: `GOCSPX-xxxx`
3. **COPY BOTH VALUES** - you'll need them next!

---

## 🔑 Update Environment Variables

### Local Development (`.env.local`)

1. Open `i:\CODE\humbug-quiz\.env.local`
2. Update these lines:

```env
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
```

3. Save the file
4. Restart dev server: `npm run dev`

### Vercel Production Environment

1. Go to [Vercel Dashboard](https://vercel.com/)
2. Select project: **humbug-quiz**
3. Navigate to: **Settings** → **Environment Variables**

**Update `GOOGLE_CLIENT_ID`:**

- Find existing `GOOGLE_CLIENT_ID` variable
- Click "⋯" (three dots) → **Edit**
- Replace value with: `YOUR_NEW_CLIENT_ID.apps.googleusercontent.com`
- Environment: Select **Production** and **Preview** and **Development**
- Click "Save"

**Update `GOOGLE_CLIENT_SECRET`:**

- Find existing `GOOGLE_CLIENT_SECRET` variable
- Click "⋯" (three dots) → **Edit**
- Replace value with: `YOUR_NEW_CLIENT_SECRET`
- Environment: Select **Production** and **Preview** and **Development**
- Click "Save"

**Important:** After updating environment variables, you need to **redeploy**:

- Go to **Deployments** tab
- Find the latest deployment
- Click "⋯" → **Redeploy**
- Or push a new commit to trigger deployment

---

## 🧪 Testing the OAuth Flow

### Test Locally First

1. Start dev server:

   ```powershell
   npm run dev
   ```

2. Open browser: `http://localhost:5000`

3. Scroll to auth section (or click sign-in button)

4. Click "Sign in with Google"

5. **Expected flow:**

   - ✅ Redirects to Google consent screen
   - ✅ Shows "HUMBUG Quiz wants to access your Google Account"
   - ✅ Shows requested permissions (email, profile)
   - ✅ Click "Continue" or "Allow"
   - ✅ Redirects back to `http://localhost:5000`
   - ✅ Shows your profile name/picture
   - ✅ Sets `auth_token` cookie

6. **Check browser console** for debug logs:
   ```
   🔍 OAuth Debug Info:
      Host header: localhost:5000
      Detected host: localhost:5000
      Protocol: http
      App URL: http://localhost:5000
      Redirect URI: http://localhost:5000/api/auth/callback
   ```

### Test on Pre-Production

1. Push changes to `main` branch (if you have any code changes)
2. Wait for Vercel to deploy
3. Open: `https://humbug-quiz.vercel.app`
4. Test sign-in flow (same steps as above)

### Test on Production

1. Merge `main` to `master` branch
2. Wait for Vercel to deploy
3. Open: `https://humbug.hu`
4. Test sign-in flow (same steps as above)

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Google Console

**Solution:**

1. Check the error message for the actual redirect URI being used
2. Add that exact URI to Google Console "Authorized redirect URIs"
3. Make sure there are no typos or trailing slashes
4. Wait 5 minutes for Google to propagate changes

### Error: "access_denied"

**Problem:** User cancelled sign-in or app not verified

**Solution:**

- If testing: Click "Advanced" → "Go to HUMBUG Quiz (unsafe)"
- For production: Submit app for verification (only needed for >100 users)

### Error: "invalid_client"

**Problem:** Client ID or Secret is wrong

**Solution:**

1. Double-check environment variables in Vercel
2. Make sure you copied the correct values from Google Console
3. No extra spaces or quotes around values
4. Redeploy after changing environment variables

### Error: "disabled_client" (Old Error)

**Problem:** Old OAuth client was suspended

**Solution:** ✅ You're creating a new client, this won't happen anymore

### Error: "Empty Origin URI"

**Problem:** You tried to save without entering any URI

**Solution:** Make sure you paste all 3 JavaScript Origins (see above)

---

## 📝 Configuration Summary

After completing all steps, you should have:

**Google Cloud Console:**

- ✅ Project created
- ✅ Google+ API enabled
- ✅ OAuth consent screen configured
- ✅ OAuth 2.0 Client ID created with:
  - 3 Authorized JavaScript Origins
  - 3 Authorized Redirect URIs

**Local Environment (`.env.local`):**

```env
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
JWT_SECRET=your-jwt-secret (keep existing value)
POSTGRES_POSTGRES_URL=your-db-url (keep existing value)
```

**Vercel Environment Variables:**

- ✅ `GOOGLE_CLIENT_ID` updated (all environments)
- ✅ `GOOGLE_CLIENT_SECRET` updated (all environments)
- ✅ Redeployed

**Testing:**

- ✅ Local (`localhost:5000`) - Sign in works
- ✅ Pre-prod (`humbug-quiz.vercel.app`) - Sign in works
- ✅ Production (`humbug.hu`) - Sign in works

---

## 🔒 Security Best Practices

1. **Never commit credentials to Git:**

   - `.env.local` is in `.gitignore` ✅
   - Only store in Vercel environment variables

2. **Keep Client Secret private:**

   - Only store server-side (Vercel env vars)
   - Never expose in frontend code

3. **Rotate credentials if exposed:**

   - If you accidentally commit secrets, rotate them immediately
   - Generate new OAuth client in Google Console

4. **Monitor OAuth usage:**
   - Check Google Cloud Console for unusual activity
   - Set up billing alerts (if applicable)

---

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs:**

   - Vercel Dashboard → Project → Functions → View Logs
   - Look for OAuth-related errors

2. **Check Browser Console:**

   - Press F12
   - Look for network errors in Console tab
   - Check Network tab for failed requests

3. **Verify Environment Variables:**

   - Make sure all 4 env vars are set in Vercel
   - No typos or extra characters

4. **Contact:**
   - Email: humbug@humbug.hu
   - Check PRODUCTION_ISSUES_FIX.md for more details

---

## ✅ Checklist

- [ ] Create new Google Cloud Project
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 Client ID
- [ ] Add 3 Authorized JavaScript Origins
- [ ] Add 3 Authorized Redirect URIs
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Update `.env.local`
- [ ] Update Vercel `GOOGLE_CLIENT_ID`
- [ ] Update Vercel `GOOGLE_CLIENT_SECRET`
- [ ] Redeploy Vercel (all environments)
- [ ] Test on localhost:5000
- [ ] Test on humbug-quiz.vercel.app
- [ ] Test on humbug.hu
- [ ] Verify profile page works
- [ ] Verify sign out works

---

**Status**: Ready to configure ✅  
**Estimated Time**: 15-20 minutes  
**Last Updated**: 2025-10-23
