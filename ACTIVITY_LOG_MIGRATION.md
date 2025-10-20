# Activity Log Migration Guide

This guide explains how to deploy the activity logging system to your Vercel production environment.

## Overview

The activity logging system provides a complete audit trail for all admin actions:

- Tracks create/update/delete operations on users, questions, and packs
- Captures who performed the action, when, and what changed
- Records IP address and user agent for security
- Stores flexible details in JSONB format

## Database Schema

The migration creates the `activity_logs` table:

```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action_type TEXT CHECK (action_type IN ('create', 'update', 'delete')),
  entity_type TEXT CHECK (entity_type IN ('user', 'question', 'pack', 'answer')),
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Plus 6 indexes for optimal query performance.

## Migration Steps

### Option 1: Via Vercel Dashboard (Recommended)

1. **Navigate to your database**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project: `humbug-quiz`
   - Click "Storage" tab
   - Click on your Postgres database

2. **Open the Query interface**:

   - Click the "Query" tab
   - This opens a SQL editor connected to your production database

3. **Run the migration**:

   - Open the file: `database/migrations/add-activity-logs.sql`
   - Copy all the SQL content
   - Paste into the Vercel Query editor
   - Click "Run Query"
   - You should see: `CREATE TABLE` and `CREATE INDEX` success messages

4. **Verify the migration**:
   - Click the "Tables" tab in Vercel dashboard
   - Look for `activity_logs` in the table list
   - Click on it to see the schema
   - Confirm all columns and indexes are present

### Option 2: Via Command Line

```bash
# 1. Pull your environment variables (if not already done)
vercel env pull .env.local

# 2. Run the migration (replace with your actual connection string)
psql $POSTGRES_URL_NON_POOLING -f database/migrations/add-activity-logs.sql

# Or if you have the connection string directly:
psql "postgresql://user:pass@host/db?sslmode=require" -f database/migrations/add-activity-logs.sql
```

### Option 3: Using Database Client (TablePlus, DBeaver, pgAdmin)

1. Get your connection string from Vercel:

   - Dashboard → Storage → Postgres → ".env.local" tab
   - Copy the `POSTGRES_URL_NON_POOLING` value

2. Connect your database client using that connection string

3. Open the migration file: `database/migrations/add-activity-logs.sql`

4. Execute the SQL in your client

5. Verify the `activity_logs` table exists

## Post-Migration Verification

### 1. Check Table Structure

In Vercel Query tab or your SQL client:

```sql
-- Check table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'activity_logs';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'activity_logs';
```

Expected output:

- 9 columns: id, user_id, action_type, entity_type, entity_id, details, ip_address, user_agent, created_at
- 6 indexes: primary key + 5 additional indexes

### 2. Test Activity Logging

1. Deploy the updated code (it's already committed to main):

   ```bash
   git push origin main
   ```

2. Wait for Vercel deployment to complete

3. Open your admin panel: https://humbug-quiz.vercel.app/admin

4. Perform a test action:

   - Edit a user's role
   - Update a question
   - Modify a pack description

5. Navigate to the Activity page in admin panel

6. Verify the action appears in the log with:
   - Your admin name/email/picture
   - Correct action type (update)
   - Correct entity type (user/question/pack)
   - Timestamp
   - Details of what changed

### 3. Query Activity Logs Directly

```sql
-- See recent activities
SELECT
  al.id,
  u.email as admin_email,
  al.action_type,
  al.entity_type,
  al.entity_id,
  al.details,
  al.created_at
FROM activity_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;
```

## What Gets Logged

### User Operations

- **Update**: Logs role changes and is_active status changes
- **Delete**: Logs the deleted user's email

### Question Operations

- **Update**: Logs question_en, question_hu, and answer count
- **Delete**: Logs the question deletion

### Pack Operations

- **Update**: Logs name_en, name_hu, pack_type, and access_level changes
- **Delete**: Logs the deleted pack's name

### Additional Data Captured

- **IP Address**: The admin's IP address (if available behind Vercel proxy)
- **User Agent**: Browser/client information
- **Timestamp**: Exact time of action (with timezone)

## Troubleshooting

### Migration Fails: "relation already exists"

The table already exists. This is safe to ignore. The migration uses `CREATE TABLE IF NOT EXISTS`.

### Migration Fails: "permission denied"

Ensure you're using `POSTGRES_URL_NON_POOLING` (not the pooled connection) as it has full DDL permissions.

### Activity Page Shows Empty

**Before migration**: This is expected. The table doesn't exist yet.

**After migration**:

1. Verify the migration ran successfully (check table exists)
2. Perform a test action (update a user, question, or pack)
3. Check if that action appears in the activity log
4. If not, check Vercel function logs for errors

### Activity Logging Doesn't Record Actions

1. Check Vercel function logs:

   - Dashboard → Project → Deployments → Click latest → Functions tab
   - Look for errors in `/api/admin`

2. Verify the code is deployed:

   - Check that your latest commit (with activity logging) is deployed
   - Git hash should match latest push

3. Check database connection:
   - Ensure `POSTGRES_POSTGRES_URL` environment variable is set
   - Test with a manual query in Vercel dashboard

### IP Address Shows NULL

This is normal on localhost or if Vercel proxy doesn't forward the IP. The logging is non-blocking, so NULL IPs won't prevent operations.

## Rollback (If Needed)

If you need to remove the activity logging system:

```sql
-- Remove the table and all logs
DROP TABLE IF EXISTS activity_logs CASCADE;
```

**Note**: This will permanently delete all activity history. Consider exporting logs first if needed.

## Next Steps

After confirming activity logging works:

1. **Monitor usage**: Check the activity page regularly
2. **Export logs**: Consider periodic exports for long-term compliance
3. **Dashboard**: The next feature will display activity metrics and charts
4. **Retention policy**: Consider adding a cleanup job for old logs (e.g., >1 year)

## Support

If you encounter issues:

1. Check Vercel function logs
2. Verify database connection
3. Test with direct SQL queries
4. Check that the migration completed successfully

The activity logging system is non-blocking - if it fails, your admin operations will still work. Check logs to identify and fix issues.
