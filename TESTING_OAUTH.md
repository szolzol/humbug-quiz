# OAuth Enhancement Testing Guide

## Quick Testing Steps

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Session Endpoint (Before Login)

Open browser console and run:

```javascript
fetch("/api/auth/session", { credentials: "include" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Session Check:", data);
    // Expected: { authenticated: false, user: null }
  });
```

### 3. Login via Google OAuth

- Click "Sign In" button
- Authenticate with Google
- You'll be redirected back to the app

### 4. Test Session Endpoint (After Login)

```javascript
fetch("/api/auth/session", { credentials: "include" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Session Check:", data);
    // Expected: {
    //   authenticated: true,
    //   user: {
    //     id: "...",
    //     email: "...",
    //     name: "...",
    //     picture: "...",
    //     role: "free"  // 👈 NEW FIELD
    //   }
    // }
  });
```

### 5. Test Admin Auth Check (As Regular User)

```javascript
fetch("/api/admin/auth/check", { credentials: "include" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Admin Check:", data);
    // Expected: { hasAccess: false, role: "free", user: null }
  });
```

### 6. Check Session Token in Cookies

1. Open DevTools → Application → Cookies
2. Find `auth_token` cookie
3. Copy the value
4. Decode it (base64):

```javascript
const token = "YOUR_TOKEN_HERE";
const decoded = JSON.parse(atob(token));
console.log("Token Contents:", decoded);
// Should now include "role": "free"
```

### 7. Test Role Badge in UI

- Click on your avatar in the header
- Dropdown should show your email
- If you're an admin/creator, you'll see a gold badge with role

### 8. Promote User to Admin (Database)

Connect to your Postgres database and run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 9. Test After Role Change

**Important:** Logout and login again (role is cached in session token)

```javascript
// After re-login:
fetch("/api/admin/auth/check", { credentials: "include" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Admin Check:", data);
    // Expected: {
    //   hasAccess: true,
    //   role: "admin",
    //   user: { id, email, name, picture }
    // }
  });
```

### 10. Check Admin Badge

- Click avatar dropdown
- Should now see: `👑 admin` badge

---

## Expected Behaviors

### ✅ Session Token

- Contains `role` field from database
- Expires after 7 days
- Updated on each login

### ✅ Session Check

- Verifies user exists in database
- Checks `is_active` status
- Returns current role from database
- Returns 401 if session expired

### ✅ Admin Check

- Returns `hasAccess: false` for free/premium users
- Returns `hasAccess: true` for admin/creator users
- Only returns user details if has access
- Independent of session check

### ✅ UI Behavior

- Avatar shows in header when logged in
- Dropdown shows email
- Gold badge appears for admin/creator roles
- No badge for free/premium users

---

## Troubleshooting

### Issue: Role not showing in session

**Solution:** Logout and login again (role is cached in token)

### Issue: Still showing "free" after database update

**Solution:**

1. Logout completely
2. Clear cookies
3. Login again
4. Check token again

### Issue: Admin check returns false for admin

**Solution:**

1. Verify database role: `SELECT role FROM users WHERE email = '...'`
2. Ensure you logged in AFTER role change
3. Check session token contains correct role

### Issue: Database not configured error

**Solution:**

1. Check `.env.local` has `POSTGRES_POSTGRES_URL`
2. Restart dev server
3. Test database connection

---

## Using the Auth Helpers in Code

### Backend (API Endpoints):

```typescript
import { requireAdmin } from "../lib/auth";

// In your middleware:
export default async function handler(req, res) {
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return; // 403 already sent

  // Continue with admin logic
  // adminUser has type: { id, email, name, picture, role: "admin" | "creator" }
}
```

### Frontend (React Components):

```typescript
import { useAdminAuth } from "@/hooks/useAdminAuth";

function MyComponent() {
  const { hasAccess, role, isLoading, user } = useAdminAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!hasAccess) return <div>Access Denied</div>;

  return <div>Admin Panel - Welcome {user.name}</div>;
}
```

---

## Next Steps After Testing

1. ✅ Verify all endpoints work
2. ✅ Confirm role badge appears
3. ✅ Test role promotion flow
4. 📋 Create admin_activity_log table (Phase 1 Part 2)
5. 📋 Build admin UI shell with routing
6. 📋 Implement question management (Phase 2)
