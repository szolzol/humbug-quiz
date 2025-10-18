# 🧹 Project Cleanup Plan - October 2025

## ✅ Cleanup Status: COMPLETED

This document outlines the completed project cleanup that removed legacy files, migration scripts, and hardcoded data.

**Completed on:** October 18, 2025

**Total files archived:** 50+ files moved to `legacy/` folder (gitignored)

---

## 🗂️ Phase 1: Legacy Files to Archive

### Database Migration Scripts (Already Executed)

These scripts were one-time migrations and are no longer needed:

**Move to `legacy/database-migrations/`:**

- ❌ `check-all-packs.js` - Pack verification (replaced by verify-quiz-rename.js)
- ❌ `check-database.js` - General DB check (not needed)
- ❌ `check-first-question.js` - First question check (fixed)
- ❌ `check-hun-questions.js` - Hungarian question ID checker (one-time use)
- ❌ `check-original-questions.js` - Original question check (archived)
- ❌ `check-original-us-pack.js` - US pack check (one-time use)
- ❌ `check-pack-content-detailed.js` - Detailed pack check (archived)
- ❌ `check-questions.js` - Question check (archived)
- ❌ `check-slugs.js` - Slug verification (archived)
- ❌ `check-us-pack-duplicates.js` - Duplicate check (fixed)
- ❌ `cleanup-duplicates.js` - Duplicate cleanup (executed)
- ❌ `execute-cleanup.js` - Cleanup executor (executed)
- ❌ `find-hun-questions.js` - Hungarian question finder (one-time use)
- ❌ `fix-first-question.js` - First question fix (executed)
- ❌ `identify-original-us-questions.js` - US question identifier (one-time)
- ❌ `migrate-questions.js` - Question migration (executed)
- ❌ `migrate-two-packs.js` - Two-pack migration (executed)
- ❌ `move-to-premium.js` - Premium migration (executed)
- ❌ `publish-sets.js` - Set publisher (executed)
- ❌ `remove-moved-questions.js` - Question remover (executed)
- ❌ `rename-original-to-free.js` - Free pack rename (executed)
- ❌ `rename-to-quiz.js` - Quiz rename (executed)
- ❌ `reorganize-packs.js` - Pack reorganization (executed)
- ❌ `reorganize-packs.sql` - SQL reorganization (executed)
- ❌ `analyze-duplicates.js` - Duplicate analyzer (executed)
- ❌ `show-original-questions.js` - Original questions viewer (archived)
- ❌ `update-access-levels.js` - Access level updater (executed)

**Keep in `database/` (Active Scripts):**

- ✅ `schema.sql` - Database schema (reference)
- ✅ `setup-schema.js` - Schema setup (active)
- ✅ `show-pack-descriptions.js` - Pack description viewer (active)
- ✅ `update-pack-descriptions.js` - Pack description updater (active)
- ✅ `verify-quiz-rename.js` - Quiz rename verifier (active)
- ✅ `README.md` - Database documentation (active)
- ✅ `SCHEMA_DOCUMENTATION.md` - Schema reference (active)
- ✅ `SCHEMA_DIAGRAMS.md` - Schema diagrams (active)
- ✅ `STEP_BY_STEP_GUIDE.md` - Setup guide (active)

**Move to `legacy/database-translations/`:**

- ❌ `translations/us-starter-pack-hu.js` - Hardcoded translations (now in DB)
- ❌ `translations/hun-starter-pack-en.js` - Hardcoded translations (now in DB)

---

## 🗂️ Phase 2: Documentation Files to Archive

### Legacy Planning & Implementation Docs

**Move to `legacy/planning-docs/`:**

- ❌ `DATABASE_SCHEMA_PLANNING_COMPLETE.md` - Planning phase doc
- ❌ `IMPLEMENTATION_COMPLETE.md` - Implementation doc
- ❌ `IMPLEMENTATION_SUMMARY.md` - Implementation summary
- ❌ `PERSISTENCE_LAYER_PLAN.md` - Persistence layer planning

### Legacy Fix Documentation

**Move to `legacy/fix-docs/`:**

- ❌ `BROWSER_COMPATIBILITY.md` - Browser compat fixes (fixed)
- ❌ `GRADIENT_FALLBACKS_FIX.md` - Gradient fixes (fixed)
- ❌ `PRIVACY_MODAL_FIX.md` - Privacy modal fixes (fixed)
- ❌ `SCROLLBAR_FIX.md` - Scrollbar fixes (fixed)

**Keep (Active Documentation):**

- ✅ `README.md` - Main documentation
- ✅ `VERCEL_DEPLOYMENT.md` - Deployment guide
- ✅ `VERCEL_ENV_VARS.md` - Environment variables
- ✅ `.github/instructions/agents.md` - AI agent instructions

---

## 🗂️ Phase 3: Source Media to Archive

**Move to `legacy/source-media/`:**

- ❌ `source_media/Humbug_rules.txt` - Original rules text
- ❌ `source_media/Humbug_sample_questions_and_answers.txt` - Sample questions
- ❌ `source_media/questions_extracted.txt` - Extracted questions

These were used during initial development and are now in the database.

---

## 🧹 Phase 4: Frontend Data Cleanup

### Remove Hardcoded Questions from Locale Files

**Files to clean:**

- `src/locales/hu.json` - Remove `allQuestions` array (lines ~99-766)
- `src/locales/en.json` - Remove `allQuestions` array (lines ~99-718)

**Reason:** Questions are now stored in the database and fetched via API.

### Check App.tsx for Hardcoded Data

**Verify and remove:**

- Hardcoded question data
- Hardcoded pack data
- Any static question/answer arrays

---

## 📦 Phase 5: Test Files to Archive

**Move to `legacy/test-files/`:**

- ❌ `test/generate-favicon.html` - Favicon generator
- ❌ `test/generate-icons.js` - Icon generator
- ❌ `test/generate-icons.ps1` - Icon generator script
- ❌ `test/humbug-quiz.vercel.app-20251014T202545.json` - Old export
- ❌ `test/ICONS_README.md` - Icon documentation

---

## 🎯 Execution Plan

### Step 1: Create Legacy Directory Structure

```bash
mkdir legacy
mkdir legacy/database-migrations
mkdir legacy/database-translations
mkdir legacy/planning-docs
mkdir legacy/fix-docs
mkdir legacy/source-media
mkdir legacy/test-files
```

### Step 2: Move Legacy Files

Execute file moves using PowerShell or manual file operations.

### Step 3: Update .gitignore

Add to `.gitignore`:

```
# Legacy files (archived, not for git)
legacy/
```

### Step 4: Clean Frontend Files

- Remove `allQuestions` from `src/locales/hu.json`
- Remove `allQuestions` from `src/locales/en.json`
- Verify `src/App.tsx` has no hardcoded question data

### Step 5: Verify Application

- Test dev server: `npm run dev`
- Verify questions load from database
- Verify pack switching works
- Test authentication flow

### Step 6: Commit Clean State

```bash
git add .
git commit -m "chore: cleanup legacy files and remove hardcoded question data

- Moved 30+ legacy migration scripts to legacy/ folder
- Moved planning and implementation docs to legacy/
- Moved source media files to legacy/
- Moved test files to legacy/
- Removed hardcoded questions from locale files
- Added legacy/ to .gitignore
- Questions now exclusively from database"
```

---

## 📊 Summary

### Files to Move: ~50 files

- Database migration scripts: 30+
- Documentation files: 8
- Source media: 3
- Test files: 5
- Translation files: 2

### Files to Keep in Root: ~15 files

- Active database scripts: 8
- Active documentation: 3
- Configuration files: All
- Source code: All

### Frontend Cleanup:

- Remove ~600 lines from `hu.json`
- Remove ~600 lines from `en.json`
- Total: ~1200 lines of hardcoded data removed

---

## ✅ Completed Benefits

1. ✅ **Cleaner Repository**: Only active, relevant files in git
2. ✅ **Better Organization**: Legacy files archived to `legacy/` (gitignored)
3. ✅ **Reduced Confusion**: Clear separation between active and archived
4. ✅ **Smaller Codebase**: ~1200 lines removed from frontend locale files
5. ✅ **Single Source of Truth**: Questions exclusively from database (no fallback)
6. ✅ **Easier Maintenance**: No duplicate data to sync
7. ✅ **Fixed API Issues**: Query string handling in vite.config.ts middleware
8. ✅ **Correct Pack Visibility**: All 3 packs visible when authenticated

## 📂 Legacy Folder Structure

```
legacy/
├── database-migrations/     # 27 executed migration scripts
├── database-translations/   # Hardcoded translation files
├── planning-docs/           # 4 planning documents
├── fix-docs/                # 4 fix documentation files
├── deployment-docs/         # VERCEL_DEPLOYMENT.md, VERCEL_ENV_VARS.md
├── source-media/            # Original source files
└── test-files/              # Test and utility files
```

**Note:** The `legacy/` folder is gitignored and kept locally for reference only.

---

**Status**: Ready for execution
**Last Updated**: October 18, 2025
