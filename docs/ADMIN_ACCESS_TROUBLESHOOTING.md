# Admin Access Troubleshooting Guide

## Problem: Admin Rights Work on Localhost but Not on Vercel

### Root Cause

The admin role is **stored in the database**, not in the OAuth credentials. When you log in:

1. **OAuth callback** creates/updates user in database
2. **New users** get default role: `'free'`
3. **Role is fetched** from database and stored in session token
4. **Session token** caches the role for 7 days

**Why it works on localhost:**

- Your local database has your user with `role = 'admin'`

**Why it fails on Vercel:**

- The production database has your user with `role = 'free'` (default)
- OR your user doesn't exist in production database yet

---

## Solution: Grant Admin Role in Production Database

### Step 1: Verify User Exists in Production

Run this script to see all users in your production database:

```bash
cd database
node list-users.js
```

This will show:

- All users in the database
- Their current roles
- When they last logged in
- Active/inactive status

### Step 2: Grant Admin Role

Once you've confirmed your user exists, grant admin access:

```bash
cd database
node set-admin-role.js your-email@example.com
```

Replace `your-email@example.com` with your actual Google account email.

### Step 3: Clear Session Cache

The role is cached in the session token (7-day expiration). To apply immediately:

**Option A: Logout and Login**

1. Click "Logout" in the app
2. Log in again
3. Admin access should now work

**Option B: Clear Cookies**

1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Delete `auth_token` cookie
4. Refresh page and log in again

**Option C: Wait for Session to Expire**

- Session expires in 7 days
- Not recommended - too slow!

---

## Alternative: Connect to Production Database Directly

If the scripts don't work, you can connect directly to your Vercel Postgres database:

### Using Vercel Dashboard

1. Go to your Vercel project
2. Navigate to Storage > Your Postgres Database
3. Click "Query" tab
4. Run this SQL:

```sql
-- Check if user exists
SELECT id, email, name, role, is_active
FROM users
WHERE email = 'your-email@example.com';

-- Grant admin role
UPDATE users
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT id, email, name, role
FROM users
WHERE email = 'your-email@example.com';
```

### Using psql or Another Database Client

1. Get connection string from Vercel dashboard
2. Connect: `psql "postgres://..."`
3. Run the SQL queries above

---

## Understanding the User Flow

### First Login (New User)

```
1. User logs in with Google OAuth
   ↓
2. OAuth callback receives user info (id, email, name, picture)
   ↓
3. INSERT INTO users with default role = 'free'
   ↓
4. Fetch role from database → gets 'free'
   ↓
5. Create session token with role = 'free'
   ↓
6. User has NO admin access
```

### After Granting Admin Role

```
1. Admin runs: node set-admin-role.js user@example.com
   ↓
2. UPDATE users SET role = 'admin'
   ↓
3. User logs out and logs in again
   ↓
4. OAuth callback updates user (ON CONFLICT DO UPDATE)
   ↓
5. Fetch role from database → gets 'admin'
   ↓
6. Create session token with role = 'admin'
   ↓
7. User has admin access ✅
```

---

## Environment-Specific Notes

### Localhost Development

- Uses `.env.local` for database connection
- Database: Usually local PostgreSQL or development instance
- Permissions: Can be set freely during development

### Vercel Preview/Production

- Uses Vercel environment variables
- Database: Vercel Postgres (production instance)
- Permissions: Must be set carefully (production data)

---

## Quick Fix Summary

**TL;DR: If admin works locally but not on Vercel:**

1. **Run this:**

   ```bash
   cd database
   node list-users.js
   ```

2. **Then this:**

   ```bash
   node set-admin-role.js your-email@example.com
   ```

3. **Then logout/login in the app**

That's it! 🎉

---

## Database Schema Reference

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Google OAuth ID
  email TEXT UNIQUE NOT NULL,       -- Google email
  name TEXT,                        -- Display name
  picture TEXT,                     -- Profile picture URL
  role user_role DEFAULT 'free',    -- free | premium | admin | creator
  is_active BOOLEAN DEFAULT true,   -- Account active/suspended
  last_login TIMESTAMPTZ,           -- Last login time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Role Hierarchy

1. **creator** 👑 - Super admin (highest level)
2. **admin** 🔑 - Admin access to panel
3. **premium** ⭐ - Premium subscriber
4. **free** 👤 - Free tier user (default)

---

## Scripts Available

### list-users.js

**Purpose:** View all users and their roles
**Usage:** `node list-users.js`
**Output:** Table of all users with role breakdown

### set-admin-role.js

**Purpose:** Grant admin access to a user
**Usage:** `node set-admin-role.js <email>`
**Requirements:** User must exist (logged in at least once)

---

## Common Issues

### "User not found"

**Problem:** User hasn't logged in to production yet
**Solution:**

1. Have user log in to Vercel deployment first
2. Then run set-admin-role.js

### "Still no admin access after granting role"

**Problem:** Session token still has old role cached
**Solution:** Logout and login again (or clear cookies)

### "Database connection error"

**Problem:** Environment variables not set correctly
**Solution:**

- For localhost: Check `.env.local` has `POSTGRES_POSTGRES_URL`
- For Vercel: Check environment variables in Vercel dashboard

### "Role reverts back to 'free'"

**Problem:** Database is being reset or using wrong database
**Solution:**

- Check you're connecting to production database
- Verify POSTGRES_POSTGRES_URL points to production
- Check for any database reset scripts in deploy process

---

## Security Best Practices

1. **Limit Admin Users**

   - Only grant admin to trusted users
   - Use `creator` role for super admins
   - Use `admin` role for content managers

2. **Monitor Admin Activity**

   - Check `admin_activity_log` table regularly
   - Look for suspicious actions
   - Review user role changes

3. **Regular Audits**

   - Run `list-users.js` monthly
   - Remove inactive admin users
   - Update roles as needed

4. **Protect Database Access**
   - Keep connection strings secret
   - Don't commit `.env.local` to git
   - Use Vercel's secret management

---

## Need More Help?

If admin access still doesn't work after following this guide:

1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify database connection in Vercel environment variables
4. Test OAuth flow works (can you login?)
5. Verify user exists in database (run list-users.js)
6. Check session token contains role (browser DevTools > Application > Cookies)

**For immediate debugging, add this to your code temporarily:**

```typescript
// In vite.config.ts, around line 407 in /api/admin/auth/check
console.log("🔍 Debug admin check:");
console.log("   Session ID:", sessionData.id);
console.log("   Session Role:", sessionData.role);
console.log("   DB Role:", userRole);
console.log("   Is Admin:", isAdmin);
```

Then check Vercel deployment logs to see what values are returned.

---

**Last Updated:** October 2024
**Version:** 1.0
**Status:** Production Fix
