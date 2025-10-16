# HUMBUG! Database Setup Guide

This folder contains all database-related files for the HUMBUG! Quiz application.

## 📁 Files

- **`schema.sql`** - Complete PostgreSQL database schema with tables, indexes, triggers, and functions
- **`SCHEMA_DOCUMENTATION.md`** - Detailed documentation of all tables, relationships, and features
- **`migrate-questions.js`** - Script to import existing questions from JSON files to database
- **`README.md`** - This file

---

## 🚀 Quick Start

### **Prerequisites**

1. Vercel account with project deployed
2. Node.js 18+ installed
3. Access to Vercel dashboard

### **Step 1: Provision Vercel Postgres**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your HUMBUG! project
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **Postgres** (powered by Neon)
6. Choose database name: `humbug-production`
7. Select region closest to your users
8. Click **Create**

Vercel will automatically:

- Create the database
- Set up connection pooling
- Add environment variables to your project:
  - `POSTGRES_URL`
  - `POSTGRES_URL_NON_POOLING`
  - `POSTGRES_USER`
  - `POSTGRES_HOST`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DATABASE`

### **Step 2: Run Schema Migration**

#### **Option A: Via Vercel Dashboard (Recommended)**

1. In Vercel Dashboard → Storage → Your Postgres Database
2. Go to **Query** tab
3. Copy contents of `database/schema.sql`
4. Paste into query editor
5. Click **Run Query**
6. Verify tables created in **Tables** tab

#### **Option B: Via Command Line**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run schema (requires psql installed)
psql $POSTGRES_URL_NON_POOLING -f database/schema.sql
```

#### **Option C: Via Node.js Script**

```bash
# Create a one-time setup script
node -e "
import { sql } from '@vercel/postgres';
import * as fs from 'fs';

const schema = fs.readFileSync('./database/schema.sql', 'utf-8');
await sql.query(schema);
console.log('Schema created successfully!');
"
```

### **Step 3: Update Admin User ID**

After first Google OAuth login:

1. Get your Google User ID from JWT token or session
2. Update the placeholder admin user:

```sql
UPDATE users
SET id = 'YOUR_GOOGLE_USER_ID'
WHERE id = 'REPLACE_WITH_GOOGLE_ID';
```

Or insert new admin:

```sql
INSERT INTO users (id, email, name, role)
VALUES (
  'YOUR_GOOGLE_USER_ID',
  'your-email@gmail.com',
  'Your Name',
  'admin'
);
```

### **Step 4: Run Question Migration**

Import the 22 existing questions from JSON files:

```bash
# Ensure environment variables are loaded
source .env.local  # or .env

# Run migration script
node database/migrate-questions.js
```

Expected output:

```
🚀 Starting HUMBUG! Questions Migration...

📋 Step 1: Verifying database schema...
✅ Schema verified

📦 Step 2: Creating question set...
✅ Question set created with ID: 1

📝 Step 3: Migrating questions and answers...
   ✅ Question 1/22: "What are the most visited cities in the United St..." (15 answers)
   ✅ Question 2/22: "Which celebrities' pages are among Instagram's t..." (12 answers)
   ...
✅ Migration complete!

📊 MIGRATION SUMMARY
============================================================
Total questions in JSON:  22
Questions created:        22
Answers created:          327
Errors:                   0
============================================================

🔍 Step 5: Verifying migration...
✅ Verification complete

🎉 Migration successful!
```

### **Step 5: Verify Setup**

Check that everything is working:

```bash
# Option 1: Via Vercel Dashboard
# Go to Storage → Tables → Browse data

# Option 2: Via psql
psql $POSTGRES_URL_NON_POOLING -c "
SELECT
  qs.name_en as set_name,
  qs.question_count,
  COUNT(q.id) as actual_count
FROM question_sets qs
LEFT JOIN questions q ON qs.id = q.set_id
GROUP BY qs.id, qs.name_en;
"

# Expected output:
#        set_name       | question_count | actual_count
# ----------------------+----------------+--------------
#  Original HUMBUG!     |             22 |           22
```

---

## 📊 Database Schema Overview

### **Core Tables**

1. **`users`** - User accounts (Google OAuth)

   - Stores: id, email, name, picture, role, preferences
   - Roles: `free`, `premium`, `admin`, `creator`

2. **`question_sets`** - Question collections/packs

   - Stores: slug, names (EN/HU), descriptions, access level
   - Access levels: `free`, `premium`, `admin_only`

3. **`questions`** - Individual quiz questions

   - Stores: question text (EN/HU), category, source, difficulty
   - Categories: entertainment, travel, sports, technology, gastronomy, culture

4. **`answers`** - Correct answers for questions
   - Stores: answer text (EN/HU), order, alternatives
   - Supports: ranked ordering, alternative spellings

### **Access Control**

5. **`user_question_set_access`** - User permissions
   - Tracks which users can access which question sets
   - Supports time-limited access and various grant sources

### **Game Tracking**

6. **`game_sessions`** - Individual game rounds

   - Tracks: game master, question set, players, duration

7. **`question_usage`** - Questions used in games
   - Tracks: marked answers, completion, bluff calls

### **Admin & Moderation**

8. **`audit_log`** - Security audit trail
9. **`user_reports`** - User-submitted content reports

See **`SCHEMA_DOCUMENTATION.md`** for complete details.

---

## 🔧 Maintenance Scripts

### **Display Database State**

```javascript
import { displayDatabaseState } from "./database/migrate-questions.js";
await displayDatabaseState();
```

### **Rollback Migration**

```javascript
import { rollback } from "./database/migrate-questions.js";
await rollback(); // Deletes "original" question set and all related data
```

### **Update Question Counts** (if triggers aren't working)

```sql
-- Recalculate question counts
UPDATE question_sets qs
SET question_count = (
  SELECT COUNT(*)
  FROM questions q
  WHERE q.set_id = qs.id
);

-- Update answer counts in metadata
UPDATE questions q
SET metadata = jsonb_set(
  metadata,
  '{estimatedAnswers}',
  to_jsonb((SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id))
);
```

---

## 🔐 Security Best Practices

### **1. Environment Variables**

Never commit these to Git:

```bash
# .env.local
POSTGRES_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### **2. Database Access**

- Use **pooled connection** (`POSTGRES_URL`) for API endpoints
- Use **direct connection** (`POSTGRES_URL_NON_POOLING`) for migrations/scripts
- Never expose database credentials in frontend code

### **3. Row-Level Security** (Future Enhancement)

Consider enabling Postgres Row-Level Security (RLS) for additional protection:

```sql
-- Enable RLS on questions table
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see questions from sets they have access to
CREATE POLICY question_access_policy ON questions
  FOR SELECT
  USING (
    set_id IN (
      SELECT set_id FROM get_user_accessible_sets(current_setting('app.user_id'))
    )
  );
```

---

## 📈 Monitoring & Performance

### **Check Database Size**

```sql
SELECT
  pg_size_pretty(pg_database_size(current_database())) as db_size;
```

### **Monitor Query Performance**

```sql
-- Top slowest queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### **Index Usage**

```sql
-- Check if indexes are being used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## 🚨 Troubleshooting

### **Problem: Tables not created**

```bash
# Check if schema file has syntax errors
psql $POSTGRES_URL_NON_POOLING -f database/schema.sql 2>&1 | grep ERROR
```

### **Problem: Migration fails with "table not found"**

```bash
# Verify schema is loaded
psql $POSTGRES_URL_NON_POOLING -c "\dt"
# Should show all tables
```

### **Problem: Triggers not firing**

```sql
-- Check if triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### **Problem: Connection errors**

```bash
# Test connection
psql $POSTGRES_URL -c "SELECT NOW();"

# Check connection pooling
psql $POSTGRES_URL_NON_POOLING -c "SELECT NOW();"
```

---

## 📚 Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

## 🔄 Schema Versioning

Current schema version: **1.0.0**

To check version:

```sql
SELECT * FROM schema_version ORDER BY applied_at DESC;
```

When schema changes:

1. Create new SQL file: `migrations/v1.1.0.sql`
2. Document changes in migration file
3. Apply migration
4. Update schema_version table

---

## ✅ Checklist

- [ ] Vercel Postgres provisioned
- [ ] Environment variables pulled locally
- [ ] Schema SQL executed successfully
- [ ] Admin user ID updated
- [ ] Questions migrated (22 questions, ~327 answers)
- [ ] Verification passed
- [ ] Sample queries tested
- [ ] API endpoints connected (next phase)

---

**Ready to build the API layer! 🚀**
