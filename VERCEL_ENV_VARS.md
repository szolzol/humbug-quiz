# Vercel Environment Variables Setup

Quick reference for setting up environment variables in Vercel Dashboard.

## How to Set Environment Variables

1. Go to: https://vercel.com/szolzols-projects/humbug-quiz/settings/environment-variables
2. Add each variable below for the appropriate environment(s)

## Required Variables by Environment

### 🔴 Production Only (master branch → https://humbug.hu)

```bash
NEXT_PUBLIC_APP_URL=https://humbug.hu
NEXT_PUBLIC_API_URL=https://humbug.hu
```

### 🟡 Preview/Pre-Production Only (main branch → https://humbug-quiz.vercel.app)

```bash
NEXT_PUBLIC_APP_URL=https://humbug-quiz.vercel.app
NEXT_PUBLIC_API_URL=https://humbug-quiz.vercel.app
```

### 🟢 All Environments (Production + Preview + Development)

**Database (Neon PostgreSQL):**

```bash
POSTGRES_POSTGRES_URL=postgresql://neondb_owner:npg_xxx@ep-xxx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Google OAuth:**

```bash
GOOGLE_CLIENT_ID=1087033170305-sjvh33p4ssqm0iie8b88etvslnr4jhg4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**JWT Secret:**

```bash
JWT_SECRET=7a9f2c8e1b4d6f3a5c8e0b2d4f6a8c0e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a
```

## Vercel UI: Environment Selection

When adding each variable, select:

**For Production-only variables:**

- ☑️ Production
- ☐ Preview
- ☐ Development

**For Preview-only variables:**

- ☐ Production
- ☑️ Preview
- ☐ Development

**For All Environments variables:**

- ☑️ Production
- ☑️ Preview
- ☑️ Development

## Verification

After setting variables, verify:

1. **Production** (https://humbug.hu):

   ```bash
   curl https://humbug.hu/api/question-sets
   ```

   Should return question sets JSON

2. **Pre-Production** (https://humbug-quiz.vercel.app):

   ```bash
   curl https://humbug-quiz.vercel.app/api/question-sets
   ```

   Should return question sets JSON

3. **Check Deployment Logs:**
   - Go to: https://vercel.com/szolzols-projects/humbug-quiz/deployments
   - Click on latest deployment
   - Check "Building" logs for any environment variable errors

## Common Issues

**Issue**: Environment variables not taking effect

**Solution**: Redeploy after adding variables

```bash
# Trigger redeploy via commit
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

**Issue**: Wrong URL in deployed app

**Solution**:

1. Check environment variable value in Vercel dashboard
2. Ensure correct environment is selected (Production vs Preview)
3. Redeploy

**Issue**: Database connection fails

**Solution**:

1. Verify `POSTGRES_POSTGRES_URL` is set for all environments
2. Check connection string format includes `?sslmode=require`
3. Test connection locally first: `node database/check-database.js`
