# Vercel Deployment Configuration

## Branch Strategy

This project uses two main branches for deployment:

- **`master`** → Production (https://humbug.hu)
- **`main`** → Pre-Production (https://humbug-quiz.vercel.app)

## Vercel Settings Required

✅ **CONFIGURED**: The following settings are already in place:

### 1. Vercel Dashboard Configuration

Navigate to: https://vercel.com/szolzols-projects/humbug-quiz

**Settings → Git:**

```
Production Branch: master
```

**Settings → Domains:**

```
Production (master):  https://humbug.hu
Pre-Production (main): https://humbug-quiz.vercel.app
```

This ensures:

- ✅ `master` → Production deployment (https://humbug.hu)
- ✅ `main` → Pre-Production deployment (https://humbug-quiz.vercel.app)
- ✅ Other branches → Temporary preview deployments

### 3. Branch Deploy Settings

Ensure the following is configured:

```
✓ Automatically deploy all branches
✓ Ignore build step for production (master only)
```

### 4. Environment Variables

Make sure the following environment variables are configured for **ALL environments** (Production + Preview):

**Required for Database:**

- `POSTGRES_POSTGRES_URL`
- `POSTGRES_DATABASE_URL`
- `POSTGRES_POSTGRES_HOST`
- `POSTGRES_POSTGRES_USER`
- `POSTGRES_POSTGRES_PASSWORD`
- `POSTGRES_POSTGRES_DATABASE`

**Required for Google OAuth:**

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`

**Required for App URLs:**

Environment-specific values:

| Environment               | NEXT_PUBLIC_APP_URL            | NEXT_PUBLIC_API_URL            |
| ------------------------- | ------------------------------ | ------------------------------ |
| **Production** (master)   | https://humbug.hu              | https://humbug.hu              |
| **Pre-Production** (main) | https://humbug-quiz.vercel.app | https://humbug-quiz.vercel.app |
| **Local Dev**             | http://localhost:5000          | http://localhost:5000          |

### 5. Google OAuth Redirect URIs

✅ **CONFIGURED**: The following redirect URIs are already added to Google Cloud Console:

**Google Cloud Console OAuth Client ID**: `1087033170305-sjvh33p4ssqm0iie8b88etvslnr4jhg4`

**Authorized redirect URIs:**

```
✅ https://humbug.hu/api/auth/callback                    (Production)
✅ https://humbug-quiz.vercel.app/api/auth/callback       (Pre-Production)
✅ http://localhost:5000/api/auth/callback                (Local Development)
```

To verify or modify:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select the OAuth 2.0 Client ID above
3. Check "Authorized redirect URIs" section

## Deployment Workflow

### Deploy to Pre-Production (main)

```bash
git checkout main
git add -A
git commit -m "feat: your feature description"
git push origin main
```

This will trigger a **Preview Deployment** on Vercel.

### Deploy to Production (master)

Once tested on `main`, merge to `master`:

```bash
git checkout master
git merge main
git push origin master
```

This will trigger a **Production Deployment** on Vercel.

## Current Status

✅ **Latest Commit on `main`**:

```
fd53725 feat: implement question packs with database + local dev auth
```

This commit includes:

- Complete database schema and migrations
- Question pack system (3 packs, 66 questions, 904 answers)
- Google OAuth with local development support
- Fixed language-independent card flip state

## Testing Pre-Production

After pushing to `main`, Vercel will deploy to:

```
🔗 https://humbug-quiz.vercel.app
```

**Pre-Production Checklist:**

- ✅ Question packs load correctly (3 packs visible in selector)
- ✅ Google OAuth login works (redirect to https://humbug-quiz.vercel.app/api/auth/callback)
- ✅ Language switching doesn't reset card state
- ✅ All 3 packs accessible (Original, US Starter, HUN Starter)
- ✅ Database queries work properly (66 questions, 904 answers)
- ✅ Card flip state persists (no language prefix in localStorage)
- ✅ User accounts created in database on first login

## Troubleshooting

**Issue**: Pre-Production deployment shows 500 errors

**Solution**:

1. Check environment variables in Vercel dashboard (Settings → Environment Variables)
2. Ensure `POSTGRES_POSTGRES_URL` is set for **Preview** environment
3. Verify `NEXT_PUBLIC_APP_URL` = `https://humbug-quiz.vercel.app` for Preview
4. Check deployment logs in Vercel dashboard

**Issue**: Google login doesn't work on pre-prod

**Solution**:
✅ Should be working now - redirect URI already configured:

```
https://humbug-quiz.vercel.app/api/auth/callback
```

If still failing:

1. Check browser console for OAuth errors
2. Verify Google OAuth Client ID and Secret are set in Vercel environment variables
3. Check that redirect URI in Google Console exactly matches deployed URL

**Issue**: Database connection fails

**Solution**:

1. Verify Neon database is accessible from Vercel
2. Check connection string format: `postgresql://user:pass@host/db?sslmode=require`
3. Ensure environment variable name is `POSTGRES_POSTGRES_URL` (exact match)
4. Test connection with: `node database/check-database.js` locally first

**Issue**: "No question packs available" error

**Solution**:

1. Verify database has been populated with questions
2. Run migration scripts if needed:
   ```bash
   node database/setup-schema.js
   node database/migrate-two-packs.js
   node database/publish-sets.js
   ```
3. Check API routes are working: `/api/question-sets`
