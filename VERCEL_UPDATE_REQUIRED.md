# ⚠️ URGENT: Update Vercel Environment Variables

## ✅ Local Environment Updated

Your `.env.local` file has been updated with new OAuth credentials.

## ⚠️ ACTION REQUIRED: Update Vercel Production

You **MUST** update these environment variables in Vercel Dashboard for production to work:

### 🔗 Go to Vercel Dashboard

https://vercel.com/szolzols-projects/humbug-quiz/settings/environment-variables

### 📝 Update These Variables:

**1. GOOGLE_CLIENT_ID**

- Current value: `OLD_CLIENT_ID.apps.googleusercontent.com` (SUSPENDED)
- **New value**: `YOUR_NEW_CLIENT_ID.apps.googleusercontent.com`
- Environments: ✅ Production ✅ Preview ✅ Development

**2. GOOGLE_CLIENT_SECRET**

- Current value: `OLD_CLIENT_SECRET` (OLD)
- **New value**: `YOUR_NEW_CLIENT_SECRET`
- Environments: ✅ Production ✅ Preview ✅ Development

### 📋 Steps:

1. Open https://vercel.com/szolzols-projects/humbug-quiz/settings/environment-variables

2. Find `GOOGLE_CLIENT_ID`:

   - Click "⋯" (three dots) → **Edit**
   - Replace with: `YOUR_NEW_CLIENT_ID.apps.googleusercontent.com`
   - Check all environments: Production, Preview, Development
   - Click **Save**

3. Find `GOOGLE_CLIENT_SECRET`:

   - Click "⋯" (three dots) → **Edit**
   - Replace with: `YOUR_NEW_CLIENT_SECRET`
   - Check all environments: Production, Preview, Development
   - Click **Save**

4. **Redeploy Required:**
   - Go to **Deployments** tab
   - Click "⋯" on latest deployment → **Redeploy**
   - Or push a commit to trigger automatic deployment

### 🧪 Testing After Update:

1. **Test Production** (after redeploy):

   - Visit: https://humbug.hu
   - Click "Sign in with Google"
   - Should redirect to Google consent screen (NOT error page)
   - Complete sign-in
   - Should return to site with profile loaded

2. **Test Pre-Production**:

   - Visit: https://humbug-quiz.vercel.app
   - Test sign-in flow

3. **Test Local** (already updated):
   ```powershell
   npm run dev
   ```
   - Visit: http://localhost:5000
   - Test sign-in flow

### ✅ Verification Checklist:

- [x] Local `.env.local` updated
- [ ] Vercel `GOOGLE_CLIENT_ID` updated
- [ ] Vercel `GOOGLE_CLIENT_SECRET` updated
- [ ] Production redeployed
- [ ] Tested sign-in on https://humbug.hu
- [ ] Tested sign-in on https://humbug-quiz.vercel.app
- [ ] Tested sign-in on http://localhost:5000
- [ ] Verified profile page works
- [ ] Verified sign-out works

### 📞 If Issues Occur:

**Error: "redirect_uri_mismatch"**

- Verify all 3 redirect URIs are added in Google Cloud Console:
  ```
  https://humbug.hu/api/auth/callback
  https://humbug-quiz.vercel.app/api/auth/callback
  http://localhost:5000/api/auth/callback
  ```

**Error: "invalid_client"**

- Double-check credentials in Vercel (no typos)
- Ensure you saved changes
- Ensure you redeployed

**Error: "disabled_client"**

- Old credentials still in use
- Update Vercel environment variables
- Redeploy

---

**⏱️ Estimated Time**: 5 minutes  
**Status**: Local ✅ | Vercel ⏳ Pending  
**Last Updated**: 2025-10-23
