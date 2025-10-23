# 🚨 PRODUCTION ISSUES - FIX CHECKLIST

**Date**: October 23, 2025  
**Branch**: master (production)

---

## ❌ Issue #1: Missing Translation Keys

**Symptoms**: Auth CTA shows literal translation keys instead of text:

- `auth.ctaTitle`
- `auth.ctaDescription`
- `auth.benefit1`
- `auth.benefit2`
- `auth.benefit3`

**Root Cause**: Missing translation keys in locale files

**Status**: ✅ FIXED

**Solution Applied**:

### English (`src/locales/en.json`)

Added to the `auth` section:

```json
"ctaTitle": "Unlock Premium Features",
"ctaDescription": "Sign in with your Google account to access exclusive content and save your progress",
"benefit1": "Access premium question packs",
"benefit2": "Save your game progress",
"benefit3": "Personalized experience"
```

### Hungarian (`src/locales/hu.json`)

Added to the `auth` section:

```json
"benefit1": "Prémium kérdéscsomagok elérése",
"benefit2": "Játékállás mentése",
"benefit3": "Személyre szabott élmény"
```

**Note**: Hungarian already had `ctaTitle` and `ctaDescription` with different wording:

- `ctaTitle`: "Még egy kört mindenkinek..."
- `ctaDescription`: "Fedezd fel az összes feladványt belépés után!"

**Next Steps**:

1. ✅ Commit changes to `main` branch
2. ⏳ Merge/deploy to `master` branch (production)
3. ⏳ Verify fix on https://humbug.hu

---

## ❌ Issue #2: Google OAuth Account Suspended

**Symptoms**: Sign in redirects to Google error page:

```
https://accounts.google.com/signin/oauth/error?authError=disabled_client
Error message: "The OAuth client was disabled."
```

**Client ID**: `1087033170305-sjvh33p4ssqm0iie8b88etvslnr4jhg4.apps.googleusercontent.com`

**Root Cause**: Google account used for OAuth was suspended - requires new OAuth client with different Google account

**Status**: ⚠️ REQUIRES NEW OAUTH CLIENT CREATION

**Solution Required**:

### ⭐ Complete Setup Guide Available

**See detailed instructions**: `GOOGLE_OAUTH_SETUP.md`  
**Quick reference**: `OAUTH_QUICK_REFERENCE.txt`

### Option A: Create New OAuth Client (REQUIRED - Account Suspended)

**Since the Google account was suspended, you need to create a completely new OAuth client with a different Google account.**

### 📋 Exact URIs to Configure:

**Authorized JavaScript Origins (copy these 3):**

```
https://humbug.hu
https://humbug-quiz.vercel.app
http://localhost:5000
```

**Authorized Redirect URIs (copy these 3):**

```
https://humbug.hu/api/auth/callback
https://humbug-quiz.vercel.app/api/auth/callback
http://localhost:5000/api/auth/callback
```

### 🔧 Step-by-Step Instructions:

**See complete guide:** `GOOGLE_OAUTH_SETUP.md` - includes:

- Creating new Google Cloud Project (if needed)
- Enabling Google+ API
- Configuring OAuth consent screen
- Creating OAuth 2.0 Client ID
- Adding authorized URIs
- Updating environment variables
- Testing the flow
- Troubleshooting common errors

**Quick summary:**

1. Create new OAuth 2.0 Client ID in Google Cloud Console
2. Add the 3 JavaScript Origins (above)
3. Add the 3 Redirect URIs (above)
4. Copy Client ID and Secret
5. Update Vercel environment variables
6. Update local `.env.local`
7. Redeploy and test

### Verification Steps

After fixing:

1. **Test on Production**:

   - Visit https://humbug.hu
   - Scroll to auth CTA section
   - Click "Sign in with Google"
   - Should redirect to Google consent screen (not error)
   - Complete sign-in flow
   - Should redirect back to humbug.hu with JWT cookie

2. **Check Network Tab**:

   ```
   1. GET /api/auth/google
      → 302 Redirect to accounts.google.com

   2. GET https://accounts.google.com/o/oauth2/v2/auth?...
      → Shows Google consent screen

   3. GET /api/auth/callback?code=...
      → 302 Redirect to /
      → Sets auth_token cookie

   4. GET /
      → Signed in, shows user info
   ```

3. **Verify Profile**:
   - Click on profile button
   - Should show Google profile name/email
   - Should be able to edit nickname
   - Should see "Sign Out" option

---

## 📋 Deployment Checklist

### Immediate Actions (Translation Fix)

- [x] Fix translation keys in `src/locales/en.json`
- [x] Fix translation keys in `src/locales/hu.json`
- [ ] Commit changes:
  ```bash
  git add src/locales/en.json src/locales/hu.json
  git commit -m "fix: add missing auth translation keys (ctaTitle, ctaDescription, benefits)"
  ```
- [ ] Push to main branch:
  ```bash
  git push origin main
  ```
- [ ] Merge to master (production):
  ```bash
  git checkout master
  git merge main
  git push origin master
  ```
- [ ] Verify on https://humbug.hu (auto-deploys from master)

### Google OAuth Fix (Requires Console Access)

- [ ] Access Google Cloud Console
- [ ] Check OAuth client status (enabled/disabled/deleted)
- [ ] If disabled: Re-enable
- [ ] If deleted: Create new client ID
- [ ] Update Vercel environment variables (if new client)
- [ ] Redeploy production (if env vars changed)
- [ ] Test sign-in flow on humbug.hu
- [ ] Verify JWT cookie is set
- [ ] Verify profile page works

---

## 🔍 Debugging Tips

### Check Current Client ID in Production

View source on https://humbug.hu or check network requests to see which client ID is being used.

### Check Environment Variables in Vercel

1. Go to Vercel Dashboard
2. Project: humbug-quiz
3. Settings → Environment Variables
4. Check `GOOGLE_CLIENT_ID` value
5. Ensure it's set for **Production** environment

### Test Locally First

Before deploying to production:

```bash
# Ensure .env.local has correct credentials
npm run dev

# Visit http://localhost:5000
# Test sign-in flow
# Should work if credentials are correct
```

### Common Issues

**Issue**: "redirect_uri_mismatch"

- **Fix**: Add exact redirect URI to Google Console authorized URIs

**Issue**: "access_denied"

- **Fix**: User cancelled sign-in or OAuth consent screen not configured

**Issue**: "invalid_client"

- **Fix**: Client ID or secret incorrect in environment variables

**Issue**: "disabled_client" ← **CURRENT ISSUE**

- **Fix**: Re-enable OAuth client in Google Console

---

## 📞 Contact Info

If you need help accessing Google Cloud Console:

- Check if you have Owner/Editor role on the project
- Contact Google Workspace admin if needed
- Can create new project if no access to original

---

## 🎯 Expected Timeline

- **Translation fix**: 5 minutes (commit + deploy)
- **OAuth fix**: 10-30 minutes (depending on if re-enable or recreate)
- **Total downtime**: ~30 minutes

---

**Last Updated**: 2025-10-23  
**Status**: Translation keys fixed ✅ | OAuth requires manual action ⚠️
