# Admin Panel - Complete Implementation Plan

## Overview
A comprehensive admin dashboard for managing users, questions, question packs, and monitoring system activity.

---

## Phase 1: Foundation ✅ (COMPLETED)
- ✅ Role-based authentication (admin/creator roles)
- ✅ Session token enhancements with role field
- ✅ Admin auth check endpoint
- ✅ Activity logging infrastructure
- ✅ Backend auth helpers (requireAdmin, requireAuth)

---

## Phase 2: Routing & Layout (IN PROGRESS)

### 2.1 Setup React Router
- Install `react-router-dom`
- Configure routes in `main.tsx`:
  - `/` - Main quiz app
  - `/admin` - Admin dashboard (protected)
  - `/admin/users` - User management
  - `/admin/questions` - Question management
  - `/admin/packs` - Pack management
  - `/admin/activity` - Activity log viewer
  - `/admin/settings` - System settings

### 2.2 Admin Layout Component
Create `src/components/admin/AdminLayout.tsx`:
- **Sidebar Navigation**
  - Dashboard (overview)
  - Users (list/edit)
  - Questions (CRUD)
  - Question Packs (CRUD)
  - Activity Log (view)
  - Settings
  - Back to Quiz (exit admin)
  
- **Top Bar**
  - Current admin user name & role badge
  - Logout button
  - Search bar (global search)

- **Protected Route Wrapper**
  - Uses `useAdminAuth()` hook
  - Redirects non-admins to main app
  - Shows loading state while checking access

---

## Phase 3: User Management

### 3.1 User List Page (`/admin/users`)

**Features:**
- Table view with columns:
  - Avatar/Photo
  - Name
  - Email
  - Role (badge: free/premium/admin/creator)
  - Last Login
  - Joined Date
  - Status (active/inactive)
  - Actions (Edit, Promote/Demote)

- **Filters & Search:**
  - Search by name/email
  - Filter by role (all/free/premium/admin/creator)
  - Filter by status (active/inactive)
  - Sort by: name, email, joined date, last login

- **Pagination:**
  - 25/50/100 users per page
  - Total count display

- **Bulk Actions:**
  - Select multiple users
  - Bulk role change
  - Bulk activate/deactivate

### 3.2 User Edit Dialog

**Fields:**
- Name (editable)
- Email (read-only, from Google)
- Role dropdown:
  - free
  - premium
  - admin (requires confirmation)
  - creator (requires confirmation)
- Active status toggle
- Display created_at, last_login (read-only)

**Actions:**
- Save Changes → logs "update" activity
- Deactivate Account → logs "update" activity
- View Activity History → shows all logs for this user

### 3.3 Backend Endpoints

```typescript
// GET /api/admin/users?page=1&limit=50&role=all&search=john&status=active
// Returns paginated user list

// GET /api/admin/users/:id
// Returns single user details

// PUT /api/admin/users/:id
// Updates user (role, name, is_active)
// Logs activity: action='update', entity='user', details={changes}

// POST /api/admin/users/:id/promote
// Shortcut endpoint for role promotion
// Logs activity with old/new role

// POST /api/admin/users/:id/demote
// Shortcut endpoint for role demotion
```

---

## Phase 4: Question Management

### 4.1 Question List Page (`/admin/questions`)

**Features:**
- Table/Card view toggle
- Columns:
  - Question ID
  - Question text (truncated, click to expand)
  - Category
  - Pack (free/premium/advanced)
  - Language support (EN/HU badges)
  - Image preview (if exists)
  - Actions (Edit, Delete, Duplicate)

- **Filters:**
  - Search question text
  - Filter by pack
  - Filter by category
  - Filter by language availability
  - Filter by "has image" / "no image"

- **Sorting:**
  - By ID, category, pack, date created

### 4.2 Question Editor (Add/Edit)

**Two-column layout:**

**Left Column - Question Details:**
- Question text (textarea)
- Category dropdown (existing categories + add new)
- Pack assignment (free/premium/advanced)
- Image upload/URL
  - Preview
  - Remove button
  - Alt text field

**Right Column - Answers:**
- 4 answer inputs (A, B, C, D)
- Correct answer selector (radio buttons)
- Explanation text (optional, textarea)

**Multi-language Support:**
- Language tabs (EN / HU)
- Switch between languages to edit both versions
- "Copy from EN" button for HU tab

**Preview Panel:**
- Shows how question will appear in quiz
- Toggle between EN/HU preview

**Actions:**
- Save Question → logs "create" or "update"
- Save & Add Another
- Cancel (with unsaved changes warning)
- Delete (requires confirmation)

### 4.3 Question Import/Export

**Import:**
- Upload JSON file (same format as current questions)
- Bulk import with validation
- Preview before import
- Error handling (duplicate IDs, invalid format)

**Export:**
- Export all questions
- Export by pack
- Export by category
- Format: JSON (current format)
- Logs "export" activity

### 4.4 Backend Endpoints

```typescript
// GET /api/admin/questions?page=1&limit=50&pack=all&category=all&search=text
// Returns paginated questions

// GET /api/admin/questions/:id
// Returns single question with all translations

// POST /api/admin/questions
// Creates new question
// Logs activity: action='create', entity='question'

// PUT /api/admin/questions/:id
// Updates question
// Logs activity with changed fields

// DELETE /api/admin/questions/:id
// Soft delete (mark as deleted) or hard delete
// Logs activity

// POST /api/admin/questions/import
// Bulk import from JSON

// GET /api/admin/questions/export?pack=all&category=all
// Export questions as JSON
// Logs activity
```

---

## Phase 5: Question Pack Management

### 5.1 Pack List Page (`/admin/packs`)

**View:**
- Card layout showing each pack:
  - Pack name & description
  - Total questions count
  - Categories included
  - Access level (free/premium/admin-only)
  - Actions (Edit, View Questions, Delete)

**Existing Packs:**
- Free Pack
- Premium Pack  
- Advanced Pack (if exists)

**Create New Pack:**
- Button to add custom packs
- Example: "History Pack", "Science Pack", "Expert Pack"

### 5.2 Pack Editor

**Fields:**
- Pack ID (slug, e.g., "history-pack")
- Display Name (EN/HU)
- Description (EN/HU)
- Access Level:
  - free (everyone)
  - premium (paid users)
  - admin (admin/creator only)
- Icon/Image upload
- Color theme (for UI customization)

**Question Assignment:**
- Checkbox list of all questions
- Filter/search to find questions
- Bulk select by category
- Drag & drop to reorder questions

**Preview:**
- Shows pack card as users will see it
- Question count
- Sample questions

### 5.3 Backend Endpoints

```typescript
// GET /api/admin/packs
// Returns all packs with metadata

// GET /api/admin/packs/:id
// Returns pack details + question list

// POST /api/admin/packs
// Creates new pack

// PUT /api/admin/packs/:id
// Updates pack metadata

// PUT /api/admin/packs/:id/questions
// Updates question assignments to pack

// DELETE /api/admin/packs/:id
// Deletes pack (requires confirmation, checks if questions exist)
```

---

## Phase 6: Activity Log Viewer

### 6.1 Activity Log Page (`/admin/activity`)

**Features:**
- Timeline view of all admin actions
- Each entry shows:
  - Timestamp (relative: "5 minutes ago" + absolute)
  - Admin user (avatar + name)
  - Action icon (create/update/delete/view/export)
  - Action description: "promoted user John to premium"
  - Entity link (click to view user/question/pack)
  - IP address & location (if available)
  - User agent (browser/device)

**Filters:**
- Date range picker (today/week/month/custom)
- Filter by admin user
- Filter by action type (create/update/delete/etc)
- Filter by entity type (user/question/pack)
- Search by entity ID or details

**Export:**
- Export log as CSV for auditing
- Logs this export action too!

### 6.2 Backend Endpoint

```typescript
// GET /api/admin/activity?page=1&limit=50&startDate=2025-10-01&endDate=2025-10-19&actionType=all&userId=all
// Returns paginated activity log with user details joined
```

---

## Phase 7: Dashboard Overview

### 7.1 Admin Dashboard (`/admin`)

**Statistics Cards:**
- Total Users (with breakdown by role)
- Total Questions (by pack)
- Active Users (last 7 days)
- Recent Sign-ups (this month)

**Charts:**
- User growth over time (line chart)
- Questions by category (pie chart)
- User role distribution (donut chart)
- Activity heatmap (by day/hour)

**Recent Activity Widget:**
- Last 10 admin actions
- "View All" link to activity log

**Quick Actions:**
- Add New Question
- Add New User (manual creation)
- View Reports
- Export Data

**System Health:**
- Database status
- API status
- Last backup date
- Disk usage (if applicable)

---

## Phase 8: Settings & Configuration

### 8.1 Settings Page (`/admin/settings`)

**Categories Management:**
- Add/edit/delete question categories
- Reorder categories
- Set category icons

**System Settings:**
- Quiz time limits
- Points per question
- Passing score threshold
- Max questions per session

**Email Templates (future):**
- Welcome email
- Premium upgrade confirmation
- Password reset (if adding email auth)

**Backup & Export:**
- Full database export
- Scheduled backups
- Restore from backup

---

## Database Schema Updates Needed

### New Tables:

```sql
-- Question Packs table (if not exists)
CREATE TABLE question_packs (
  id VARCHAR(50) PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_hu VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_hu TEXT,
  access_level VARCHAR(20) DEFAULT 'free', -- free/premium/admin
  icon_url TEXT,
  color VARCHAR(7), -- hex color
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Question to Pack mapping (many-to-many)
CREATE TABLE question_pack_assignments (
  id SERIAL PRIMARY KEY,
  question_id VARCHAR(50) NOT NULL,
  pack_id VARCHAR(50) NOT NULL REFERENCES question_packs(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id, pack_id)
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_hu VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### Modify existing:

```sql
-- Add deleted_at for soft deletes
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add question metadata
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
```

---

## UI Component Library

Use existing Shadcn/ui components:
- ✅ Table - for user/question lists
- ✅ Dialog - for edit modals
- ✅ Select - for dropdowns
- ✅ Button - actions
- ✅ Badge - for roles/status
- ✅ Card - for dashboard widgets
- ✅ Tabs - for multi-language editing
- ✅ Alert Dialog - for confirmations
- ✅ Toast/Sonner - for success/error messages

Additional needs:
- Date Range Picker (react-day-picker)
- Rich Text Editor (for descriptions/explanations)
- Image Upload (react-dropzone or similar)
- Charts (recharts or chart.js)

---

## Security Considerations

### Access Control:
- All `/api/admin/*` endpoints require admin/creator role
- Double-check role on sensitive actions (promote to admin)
- Log all admin actions
- Rate limiting on admin endpoints

### Audit Trail:
- Log who changed what, when, from where
- Cannot delete activity logs (append-only)
- Regular backups of activity log

### Input Validation:
- Sanitize all user inputs
- Validate question format before save
- Prevent XSS in question text/answers
- File upload validation (size, type for images)

### Permissions Matrix:

| Action | Free | Premium | Admin | Creator |
|--------|------|---------|-------|---------|
| View own data | ✅ | ✅ | ✅ | ✅ |
| Take quizzes | ✅ | ✅ | ✅ | ✅ |
| Access premium packs | ❌ | ✅ | ✅ | ✅ |
| View admin panel | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Promote to admin | ❌ | ❌ | ❌ | ✅ (creator only) |
| Manage questions | ❌ | ❌ | ✅ | ✅ |
| Manage packs | ❌ | ❌ | ✅ | ✅ |
| View activity log | ❌ | ❌ | ✅ | ✅ |
| System settings | ❌ | ❌ | ❌ | ✅ (creator only) |

---

## Development Phases

### **Phase 2: Routing & Layout** (Next, ~2 hours)
- Install react-router-dom
- Create AdminLayout with sidebar
- Setup protected routes
- Basic navigation

### **Phase 3: User Management** (~4 hours)
- User list page
- User edit dialog
- Role promotion/demotion
- Backend endpoints

### **Phase 4: Question Management** (~6 hours)
- Question list page
- Question editor (add/edit)
- Multi-language support
- Image upload
- Import/export

### **Phase 5: Pack Management** (~3 hours)
- Pack list page
- Pack editor
- Question assignment
- Database schema for packs

### **Phase 6: Activity Log Viewer** (~2 hours)
- Activity log page
- Filters & search
- Export functionality

### **Phase 7: Dashboard** (~3 hours)
- Statistics widgets
- Charts
- Quick actions
- Recent activity

### **Phase 8: Settings** (~2 hours)
- Category management
- System settings
- Backup/export

**Total Estimate: ~22 hours of development**

---

## Next Immediate Steps

1. ✅ Install react-router-dom
2. ✅ Create basic AdminLayout component
3. ✅ Setup protected routes
4. ✅ Create admin dashboard placeholder
5. Start with User Management (highest priority)

---

Would you like me to start implementing Phase 2 (Routing & Layout) now?
