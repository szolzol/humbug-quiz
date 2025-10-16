# HUMBUG! Database Implementation - Step by Step Guide

**Date:** October 16, 2025  
**Your Progress:** 🟢 Ready to start

---

## 📋 Overview

We're going to migrate your HUMBUG! quiz from storing questions in JSON files to a proper PostgreSQL database. This will enable:

- Multiple question sets (original, sports pack, tech pack, etc.)
- Access control (free vs premium questions)
- User progress tracking
- Game analytics
- Admin content management

**Estimated Time:** 2-3 hours  
**Difficulty:** Intermediate  
**Prerequisites:** Vercel account, Node.js installed

---

## ✅ Step 1: Provision Vercel Postgres (10 minutes)

### **1.1 - Access Vercel Dashboard**

1. Open your browser and go to: https://vercel.com/dashboard
2. Log in to your Vercel account
3. Find and click on your **humbug-quiz** project

**Screenshot location: Look for your project in the projects list**

---

### **1.2 - Navigate to Storage Tab**

1. In your project dashboard, click on the **"Storage"** tab at the top
2. You should see options for different storage types

**What you'll see:**

```
┌─────────────────────────────────────────┐
│  Storage                                │
├─────────────────────────────────────────┤
│  Connect a database to your project     │
│                                         │
│  [Postgres]  [KV]  [Blob]  [Edge Config]│
└─────────────────────────────────────────┘
```

---

### **1.3 - Create Postgres Database**

1. Click on **"Create Database"** button
2. Select **"Postgres"** from the options
3. Fill in the database details:
   - **Database Name:** `humbug-production` (or your preference)
   - **Region:** Select closest to your users (e.g., US East for North America)
4. Click **"Create"**

**Wait time:** 30-60 seconds while Vercel provisions your database

---

### **1.4 - Verify Database Created**

After creation, you should see:

```
✅ Database Created Successfully!

Connection Details:
- POSTGRES_URL
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

These have been automatically added to your project environment variables.
```

---

### **1.5 - Pull Environment Variables Locally**

Now we need to get these connection strings on your local machine.

**Option A: Via Vercel CLI (Recommended)**

Open PowerShell in your project folder:

```powershell
# If you don't have Vercel CLI installed:
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Pull environment variables
vercel env pull .env.local
```

**Expected output:**

```
Vercel CLI 32.x.x
? Set up "~\CODE\humbug-quiz"? Yes
🔗  Linked to szolzol/humbug-quiz
✅  Downloaded environment variables to .env.local
```

**Option B: Manual Copy**

1. In Vercel Dashboard → Settings → Environment Variables
2. Copy each variable (POSTGRES_URL, etc.)
3. Create `.env.local` file in your project root
4. Paste the variables

---

### **1.6 - Verify Local Environment Variables**

Check that `.env.local` was created:

```powershell
cat .env.local
```

**You should see something like:**

```env
POSTGRES_URL="postgres://default:xxxxx@xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
POSTGRES_URL_NON_POOLING="postgres://default:xxxxx@xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
POSTGRES_PRISMA_URL="postgres://default:xxxxx@xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true"
POSTGRES_URL_NO_SSL="postgres://default:xxxxx@xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="xxx-xxx-xxx.us-east-1.postgres.vercel-storage.com"
POSTGRES_PASSWORD="xxxxx"
POSTGRES_DATABASE="verceldb"
```

**⚠️ Important:** Never commit `.env.local` to Git! (It should already be in `.gitignore`)

---

### ✅ **Step 1 Complete!**

**Checkpoint:**

- [x] Vercel Postgres database created
- [x] Environment variables pulled locally
- [x] `.env.local` file exists with connection strings

**Next:** Step 2 - Install Required Packages

---

## 📦 Step 2: Install Required Dependencies (2 minutes)

We need to install the Vercel Postgres client library.

### **2.1 - Install @vercel/postgres**

```powershell
npm install @vercel/postgres
```

**Expected output:**

```
added 1 package, and audited 234 packages in 3s
```

---

### **2.2 - Verify Installation**

Check your `package.json`:

```powershell
cat package.json | Select-String "@vercel/postgres"
```

**Should show:**

```json
"@vercel/postgres": "^0.10.0"
```

---

### ✅ **Step 2 Complete!**

**Checkpoint:**

- [x] `@vercel/postgres` installed
- [x] Package listed in `package.json`

**Next:** Step 3 - Create Database Schema

---

## 🗄️ Step 3: Create Database Schema (5 minutes)

Now we'll create all the tables in your database.

### **3.1 - Verify Schema File Exists**

```powershell
ls database/schema.sql
```

**Should show:**

```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          10/16/2025  3:45 PM          45000 schema.sql
```

---

### **3.2 - Execute Schema via Vercel Dashboard (Easiest Method)**

**Steps:**

1. Go to Vercel Dashboard → Your Project → Storage → Your Postgres Database
2. Click on the **"Query"** tab
3. Open `database/schema.sql` in VS Code
4. Copy the **entire contents** (Ctrl+A, Ctrl+C)
5. Paste into the Vercel Query editor
6. Click **"Run Query"**

**Wait time:** 5-10 seconds

**Expected success message:**

```
✅ Query executed successfully
Rows affected: 0
```

---

### **3.3 - Verify Tables Created**

In the Vercel Query tab, run this query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output (9 tables):**

```
table_name
-------------------
answers
audit_log
game_sessions
question_usage
questions
question_sets
schema_version
user_reports
users
user_question_set_access
```

---

### **3.4 - Alternative: Execute Schema via Command Line**

If you have `psql` installed:

```powershell
# Load environment variables
$env:POSTGRES_URL_NON_POOLING = (Get-Content .env.local | Select-String "POSTGRES_URL_NON_POOLING").ToString().Split('=')[1].Trim('"')

# Execute schema (requires psql)
psql $env:POSTGRES_URL_NON_POOLING -f database/schema.sql
```

---

### **3.5 - Check Database Structure**

Run this in Vercel Query tab to see all tables with row counts:

```sql
SELECT
  schemaname,
  tablename,
  COALESCE(n_live_tup, 0) as row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

**Expected output:**

```
All tables should show 0 or 1 rows (except schema_version which has 1)
```

---

### ✅ **Step 3 Complete!**

**Checkpoint:**

- [x] Schema SQL executed successfully
- [x] 9 tables created
- [x] `schema_version` table shows v1.0.0

**Next:** Step 4 - Migrate Existing Questions

---

## 📝 Step 4: Migrate Questions from JSON to Database (5 minutes)

Now we'll import your 22 existing questions into the database.

### **4.1 - Review Migration Script**

Check that the migration script exists:

```powershell
ls database/migrate-questions.js
```

---

### **4.2 - Update package.json for ES Modules**

Open `package.json` and verify it has:

```json
{
  "type": "module",
  ...
}
```

**It should already be there.** If not, add it at the top level.

---

### **4.3 - Run Migration Script**

Execute the migration:

```powershell
node database/migrate-questions.js
```

**Expected output:**

```
🚀 Starting HUMBUG! Questions Migration...

📋 Step 1: Verifying database schema...
   Found tables: users, question_sets, questions, answers
✅ Schema verified

📦 Step 2: Creating question set...
✅ Question set created with ID: 1

📝 Step 3: Migrating questions and answers...
   ✅ Question 1/22: "What are the most visited cities in the United St..." (15 answers)
   ✅ Question 2/22: "Which celebrities' pages are among Instagram's t..." (12 answers)
   ✅ Question 3/22: "Name authors whose works are commonly included i..." (15 answers)
   ... (continues for all 22 questions)
✅ Migration complete!

============================================================
📊 MIGRATION SUMMARY
============================================================
Total questions in JSON:  22
Questions created:        22
Answers created:          327
Errors:                   0
============================================================

🔍 Step 5: Verifying migration...
   Questions in DB: 22 (expected: 22)
   Answers in DB: 327 (expected: 327)
   Set question_count: 22 (should match questions)

   Sample questions:
   1. [travel] What are the most visited cities in the United States...
      Answers: 15
   2. [technology] Which celebrities' pages are among Instagram's top...
      Answers: 12
   3. [culture] Name authors whose works are commonly included in Ame...
      Answers: 15
✅ Verification complete

🎉 Migration successful!
```

---

### **4.4 - Verify in Database**

Go to Vercel Dashboard → Query tab and run:

```sql
SELECT
  qs.name_en as set_name,
  qs.question_count,
  COUNT(q.id) as actual_count,
  (SELECT COUNT(*) FROM answers a
   JOIN questions q2 ON a.question_id = q2.id
   WHERE q2.set_id = qs.id) as answer_count
FROM question_sets qs
LEFT JOIN questions q ON qs.id = q.set_id
GROUP BY qs.id, qs.name_en, qs.question_count;
```

**Expected result:**

```
set_name          | question_count | actual_count | answer_count
------------------+----------------+--------------+-------------
Original HUMBUG!  |             22 |           22 |         327
```

---

### **4.5 - Browse Sample Data**

Check a sample question:

```sql
SELECT
  q.id,
  q.question_en,
  q.category,
  q.source_name,
  (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
FROM questions q
WHERE q.id = 1;
```

**Should show:**

```
id | question_en                                          | category | source_name | answer_count
---+------------------------------------------------------+----------+-------------+-------------
 1 | What are the most visited cities in the United St... | travel   | Wikipedia   |           15
```

---

### **4.6 - Troubleshooting (If Migration Fails)**

**Error: "Cannot find module"**

```powershell
# Ensure @vercel/postgres is installed
npm install @vercel/postgres
```

**Error: "Missing required tables"**

```
# Schema wasn't executed properly
# Go back to Step 3 and re-run schema.sql
```

**Error: "Question count mismatch"**

```
# Check your JSON files are intact
cat src/locales/en.json | Select-String "allQuestions" | Measure-Object -Line
cat src/locales/hu.json | Select-String "allQuestions" | Measure-Object -Line
```

---

### ✅ **Step 4 Complete!**

**Checkpoint:**

- [x] Migration script executed successfully
- [x] 22 questions imported
- [x] 327 answers imported
- [x] Zero errors
- [x] Data verified in database

**Next:** Step 5 - Update Admin User ID

---

## 👤 Step 5: Set Up Admin User (3 minutes)

Currently, there's a placeholder admin user in the database. We need to update it with your actual Google user ID.

### **5.1 - Get Your Google User ID**

**Option A: Sign in and check browser console**

1. Go to your deployed HUMBUG! site: https://humbug-quiz.vercel.app
2. Sign in with Google
3. Open browser DevTools (F12)
4. Go to **Application** tab → **Cookies** → Select your domain
5. Find the `auth_token` cookie
6. Copy the cookie value
7. Go to https://jwt.io
8. Paste your token in the "Encoded" field
9. Look at the decoded payload - find the `userId` or `sub` field

**Your Google User ID looks like:** `102345678901234567890` (a long number)

---

**Option B: Add console.log to your auth callback**

Temporarily edit `api/auth/callback.ts`:

```typescript
// Add this after getting user info from Google
console.log("Google User ID:", userInfo.sub);
```

Then sign in again and check Vercel logs.

---

### **5.2 - Update Admin User in Database**

Go to Vercel Dashboard → Query tab:

**If you want to update the placeholder:**

```sql
UPDATE users
SET
  id = 'YOUR_GOOGLE_USER_ID_HERE',
  email = 'your-email@gmail.com',
  name = 'Your Name',
  role = 'admin'
WHERE id = 'REPLACE_WITH_GOOGLE_ID';
```

**Or insert new admin user:**

```sql
INSERT INTO users (id, email, name, role, preferences)
VALUES (
  'YOUR_GOOGLE_USER_ID_HERE',
  'your-email@gmail.com',
  'Your Name',
  'admin',
  '{"language": "en", "autoPlayMusic": false, "visibleCategories": ["entertainment", "travel", "sports", "technology", "gastronomy", "culture"], "theme": "dark", "soundEffects": true, "notifications": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin';
```

---

### **5.3 - Verify Admin User**

```sql
SELECT id, email, name, role, created_at
FROM users
WHERE role = 'admin';
```

**Should show:**

```
id                    | email              | name      | role  | created_at
----------------------+--------------------+-----------+-------+-------------------------
102345678901234567890 | you@gmail.com      | Your Name | admin | 2025-10-16 15:30:00+00
```

---

### **5.4 - Grant Admin Access to Original Set**

Make sure your admin user has explicit access:

```sql
INSERT INTO user_question_set_access (user_id, set_id, granted_by, is_active)
SELECT
  'YOUR_GOOGLE_USER_ID_HERE',
  id,
  'admin',
  true
FROM question_sets
WHERE slug = 'original'
ON CONFLICT (user_id, set_id) DO NOTHING;
```

---

### ✅ **Step 5 Complete!**

**Checkpoint:**

- [x] Admin user ID updated with real Google ID
- [x] Admin user verified in database
- [x] Admin access granted to question sets

**Next:** Step 6 - Create API Endpoints

---

## 🔌 Step 6: Create API Endpoints (30 minutes)

Now we'll build the serverless functions to serve questions from the database.

### **6.1 - Create API Directory Structure**

```powershell
# Create new directories
New-Item -ItemType Directory -Force -Path "api/questions"
New-Item -ItemType Directory -Force -Path "api/users"
New-Item -ItemType Directory -Force -Path "api/game"
```

---

### **6.2 - Create Middleware for Authentication**

Let me create the auth middleware file:

```powershell
# I'll create this file for you
```

---

**Would you like me to:**

1. ✅ Continue creating the API endpoint files step by step?
2. ⏸️ Pause here and let you complete Steps 1-5 first?

**Recommendation:** Complete Steps 1-5 first (database setup and migration), then we'll tackle the API endpoints together.

**Current Status:**

- Steps 1-5: Database setup (Ready to execute)
- Steps 6-10: API & Frontend integration (Next phase)

---

## 🎯 Quick Command Checklist

Copy-paste these commands in order:

```powershell
# Step 1: Pull environment variables
vercel env pull .env.local

# Step 2: Install dependencies
npm install @vercel/postgres

# Step 3: Schema is already created, execute via Vercel Dashboard

# Step 4: Run migration
node database/migrate-questions.js

# Step 5: Update admin user via Vercel Query tab
# (SQL commands provided above)
```

---

**Ready to start? Let's begin with Step 1!** 🚀

---

**What would you like to do?**

1. Start with Step 1 (Provision Database)
2. Ask questions about any step
3. See the full roadmap (Steps 6-10)
