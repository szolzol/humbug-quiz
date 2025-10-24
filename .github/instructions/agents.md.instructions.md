# 🤖 AI Agents Development Notes

This document contains important learnings, considerations, and best practices discovered during the development of the HUMBUG! Quiz Party Game landing page. These notes are intended to help AI agents and developers maintain consistency and avoid common pitfalls.

---

### VSCode instructions

- NEVER interrupt a running dev server, always check background terminals for running servers and run any commands in a new terminal window
- Always expose local dev server on the local network (using `--host` flag) to test PWA and service worker features
- Always update README.MD file after key changes
- Test changes using the dev server (`npm run dev`) - building is only needed for production

## 📁 Project Structure

### Root Directory Organization

```
humbug-quiz/
├── api/                    # Vercel serverless functions
│   ├── admin.ts           # Unified admin API endpoint
│   ├── question-sets.ts   # Question packs CRUD
│   ├── auth/              # OAuth authentication
│   └── ...
├── src/                   # React application source
│   ├── components/        # React components
│   │   ├── admin/        # Admin panel components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── locales/          # i18n translations (en.json, hu.json)
│   └── ...
├── database/             # Database migration scripts
├── public/               # Static assets (fonts, images)
├── scripts/              # Database & maintenance scripts
│   ├── *.cjs            # Horror pack scripts
│   ├── run-*.js         # Migration runners
│   ├── check-*.js       # Validation scripts
│   └── test-*.js        # Test utilities
├── legacy/               # Archived files
│   ├── docs/            # Old documentation & planning
│   ├── database-migrations/
│   ├── fix-docs/
│   └── ...
├── test/                 # Test files & utilities
├── docs/                 # Current documentation
└── README.md            # Main project documentation
```

### Key Files

- `vite.config.ts` - Vite configuration with dev server API proxying
- `vercel.json` - Vercel deployment configuration
- `runtime.config.json` - Runtime environment variables
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 🏗️ Current Architecture

### Authentication System

**Google OAuth 2.0 Implementation**:

```
User Flow:
1. User clicks "Sign in with Google"
2. Frontend redirects to /api/auth/google
3. Google OAuth consent screen (prompt: 'select_account' for fast returning user login)
4. Callback to /api/auth/callback with authorization code
5. Exchange code for access token & fetch user info
6. Save/update user in database, fetch role & nickname
7. Create JWT token with user data (userId, email, name, nickname, picture, role)
8. Set httpOnly cookie (auth_token, 7 days expiry)
9. Redirect to app with ?auth=success
```

**Session Management**:

- JWT stored in httpOnly cookie (secure, sameSite: 'lax')
- Frontend checks /api/auth/session for auth state
- AuthContext provides: isAuthenticated, user, loading, logout
- Token expires after 7 days (auto logout)

**Role-Based Access Control**:

- `free` - Default role, access to free packs only
- `premium` - Access to free + premium packs
- `admin` - Full access including admin_only packs
- `creator` - Full access including admin_only packs

### Question Pack System

**Database Schema** (PostgreSQL via Neon):

```sql
-- question_sets table
CREATE TABLE question_sets (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_hu TEXT NOT NULL,
  description_en TEXT,
  description_hu TEXT,
  access_level VARCHAR(20) DEFAULT 'free', -- 'free', 'premium', 'admin_only'
  pack_type VARCHAR(20) DEFAULT 'general',
  skin VARCHAR(20) DEFAULT 'standard', -- 'standard', 'premium', 'fire'
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_hu TEXT NOT NULL,
  category VARCHAR(100),
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- answers table
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_en TEXT NOT NULL,
  answer_hu TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

**Pack Filtering by Role**:

- API endpoint: `/api/question-sets`
- Reads JWT from cookie, fetches user role from database
- Filters packs based on access_level and user role
- Admin/creator see all, premium see free+premium, free see only free

### Skinning System

**Centralized Configuration** (`src/components/QuestionCard.tsx`):

```typescript
const SKIN_STYLES = {
  standard: {
    front: { gradient, border, text, watermark... },
    back: { gradient, border, text, button... },
    shimmer: false,
    shimmerColor: ""
  },
  premium: {
    front: { gradient: "bg-gradient-to-br from-black via-purple-950 to-black", ... },
    back: { ... },
    shimmer: true,
    shimmerColor: "via-purple-400/10"
  },
  fire: {
    front: { gradient: "bg-gradient-to-br from-black via-red-950 to-black", ... },
    back: { ... },
    shimmer: true,
    shimmerColor: "via-red-400/10"
  }
};
```

**Pack Selector Skins** (`src/components/QuestionPackSelector.tsx`):

- PACK_SELECTOR_SKINS configuration matches card skins
- Each skin defines: background, border, text, radio, badge styles
- VIP badge (👑 VIP) shown for admin_only packs

**Admin Skin Editor**:

- PackEditDialog allows admins to select skin via dropdown
- Skins stored in database, applied dynamically
- All watermarks display "HUMBUG!" for branding consistency

### Admin Panel

**Unified API Endpoint**: `/api/admin.ts`

- Single serverless function for all admin operations
- Role validation via `validateAdminSession()` helper
- Activity logging for audit trail
- Operations: users CRUD, packs CRUD, questions CRUD, analytics

**Admin Components**:

- `AdminDashboard.tsx` - Main dashboard with stats & charts
- `PackEditDialog.tsx` - Pack editor with skin selector
- `UserManagementPanel.tsx` - User role management
- All protected by role check in AuthContext

**Activity Logging**:

- Every admin action logged to `admin_activity_log` table
- Includes: admin_id, action_type, entity_type, entity_id, details, IP, timestamp
- Visible in admin dashboard for audit purposes

### Database Connection Management

**Critical Pattern**:

```typescript
let sql;
try {
  const { neon } = await import("@neondatabase/serverless");
  sql = neon(process.env.POSTGRES_POSTGRES_URL!);

  // Perform queries...
  const result = await sql`SELECT * FROM ...`;
} catch (error) {
  console.error("Error:", error);
} finally {
  // Neon serverless auto-manages connections, no manual closing needed
}
```

**Important Notes**:

- Always use parameterized queries (`sql\`SELECT \* FROM users WHERE id = ${userId}\``)
- Never use string concatenation (SQL injection risk!)
- Neon serverless handles connection pooling automatically
- Check `process.env.POSTGRES_POSTGRES_URL` exists before querying

---

## 📱 Mobile & Responsive Design

### Mobile Viewport Considerations

**Critical Learning**: Always test on actual mobile devices, not just browser emulators.

- **Touch Targets**: Minimum 44px × 44px for all interactive elements (buttons, links, controls)
- **Viewport Meta Tag**: Already configured in `index.html`
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ```
- **Responsive Breakpoints**:
  - Mobile: `< 768px` (single column, simplified layouts)
  - Tablet: `768px - 1024px` (2-column grids)
  - Desktop: `> 1024px` (multi-column, enhanced animations)

### Mobile-Specific Issues

1. **Audio Autoplay**: Mobile browsers block autoplay. Always require user interaction.
2. **Hover States**: Use `onMouseEnter`/`onMouseLeave` but provide touch alternatives
3. **Fixed Positioning**: Can cause issues with virtual keyboards - use `absolute` with caution
4. **100vh Problem**: Mobile browsers with address bars make `100vh` unreliable - use `min-h-screen` instead

### Testing Checklist

- [ ] Test on actual iOS device (Safari)
- [ ] Test on actual Android device (Chrome)
- [ ] Test landscape and portrait orientations
- [ ] Test with slow 3G network throttling
- [ ] Test with touch interactions (tap, swipe, long-press)
- [ ] Verify text is readable without zooming
- [ ] Check that form inputs don't cause layout shifts

---

## 🎨 Design System

### Color Usage

**oklch() Color Space**: Modern CSS color format with better perceptual uniformity

```css
/* Primary Colors */
--background: oklch(0.15 0.1 240); /* Deep Navy */
--primary: oklch(0.75 0.15 85); /* Rich Gold */
--accent: oklch(0.85 0.18 90); /* Bright Gold */
--foreground: oklch(0.98 0 0); /* White */

/* Usage */
background-color: var(--background);
```

**Important**: oklch colors may not work on older browsers or restricted networks. Provide RGB fallbacks when needed.

### Typography Scale

**Space Grotesk Font Weights**:

- 300 (Light): Subtle text, captions
- 400 (Regular): Body text, descriptions
- 500 (Medium): Emphasis, buttons
- 600 (SemiBold): Subheadings, card titles
- 700 (Bold): Main headings, CTAs

**Critical**: Fonts are self-hosted in `public/fonts/` to work on restricted networks that block Google Fonts CDN.

### Animation Best Practices

**Framer Motion Patterns**:

```tsx
// Scroll-triggered animations - use viewport once
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}  // Prevents re-triggering
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>

// Hover animations - keep subtle
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400 }}
>
  Click Me
</motion.button>
```

**Performance Tips**:

- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left` (causes reflows)
- Use `will-change` sparingly (only when needed)
- Set `viewport={{ once: true }}` for scroll animations

---

## 🌐 Internationalization (i18n)

### Translation Structure

**File Organization**:

- `src/locales/hu.json` - Hungarian translations
- `src/locales/en.json` - English translations

**Key Principles**:

1. **Nested Keys**: Use dot notation for organization

   ```json
   {
     "hero": {
       "title": "HUMBUG!",
       "subtitle": "FAKE IT TILL YOU WIN IT"
     }
   }
   ```

2. **Array Handling**: Use `returnObjects: true`

   ```tsx
   const questions = t("allQuestions", { returnObjects: true });
   ```

3. **Pluralization**: i18next handles plural forms automatically
   ```json
   {
     "items": "{{count}} item",
     "items_other": "{{count}} items"
   }
   ```

### Common Pitfalls

- ❌ Don't hardcode text in components
- ❌ Don't forget to translate alt text, aria-labels
- ✅ Always provide translations in both languages
- ✅ Use TypeScript for translation keys when possible

---

## 🎵 Audio & Media

### Audio Player Implementation

**Key Learnings**:

1. **Preload Strategy**: Use `preload="metadata"` for better UX

   ```tsx
   <audio ref={audioRef} src={src} preload="metadata" />
   ```

2. **User Interaction Required**: Mobile browsers require user gesture

   ```tsx
   const togglePlay = () => {
     if (isPlaying) {
       audioRef.current?.pause();
     } else {
       audioRef.current?.play().catch(console.error); // Handle promise rejection
     }
   };
   ```

3. **Volume Management**: Store volume in state, not directly on audio element

   ```tsx
   const [volume, setVolume] = useState(0.3);

   useEffect(() => {
     if (audioRef.current) {
       audioRef.current.volume = volume;
     }
   }, [volume]);
   ```

### Background Music Best Practices

- Default volume: 30% (not intrusive)
- Loop attribute for continuous play
- Show controls on hover or when playing
- Persist mute state in localStorage

---

## 🃏 Interactive Cards

### Flip Card Animation

**3D Transform Approach**:

```tsx
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6, type: "spring" }}
  style={{ transformStyle: "preserve-3d" }}>
  {/* Front */}
  <div style={{ backfaceVisibility: "hidden" }}>Front Content</div>

  {/* Back */}
  <div
    style={{
      backfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
    }}>
    Back Content
  </div>
</motion.div>
```

### State Management

**localStorage Persistence**:

```tsx
// Save flipped state
useEffect(() => {
  const flipped = JSON.parse(localStorage.getItem("flippedCards") || "[]");
  setFlippedCards(flipped);
}, []);

useEffect(() => {
  localStorage.setItem("flippedCards", JSON.stringify(flippedCards));
}, [flippedCards]);
```

**Best Practices**:

- Always check for localStorage availability
- Handle JSON parse errors gracefully
- Clear localStorage on major data structure changes

---

## 🚀 Performance Optimization

### Build & Bundle Size

**Current Setup**:

- Vite for fast builds
- Code splitting by default
- Tree shaking enabled

**Key Metrics to Monitor**:

- Initial JS bundle: < 500KB
- Initial CSS bundle: < 100KB
- Time to Interactive (TTI): < 3s on 3G
- First Contentful Paint (FCP): < 1.5s

### Image Optimization

```tsx
// Use appropriate formats
hero-background.png → hero-background.webp (when possible)

// Lazy load images below the fold
<img loading="lazy" src="..." alt="..." />

// Provide multiple sizes
<img
  srcSet="image-320w.jpg 320w, image-640w.jpg 640w"
  sizes="(max-width: 640px) 100vw, 640px"
/>
```

### Font Loading Strategy

**Current Implementation**: Self-hosted fonts with `font-display: swap`

```css
@font-face {
  font-family: "Space Grotesk";
  src: url("/fonts/SpaceGrotesk-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Shows fallback font while loading */
}
```

---

## 🔌 Progressive Web App (PWA)

### Service Worker Implementation

**Location**: `public/sw.js` and `src/serviceWorkerRegistration.ts`

**Caching Strategy**: Cache-First with Network Fallback

```javascript
// Precached assets (static)
- HTML, manifest, icons, fonts

// Runtime cached (dynamic)
- JS bundles, CSS files, images
```

**Key Features**:

1. **Offline Support**: App works without network after first visit
2. **Automatic Updates**: Hourly check for new versions
3. **Update Notifications**: Users notified of new content
4. **Smart Caching**: Version-controlled cache management

### Service Worker Best Practices

**Development vs Production**:

```typescript
// Service worker ONLY in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}
```

**Testing PWA**:

```bash
# Build production version
npm run build
npm run preview

# Test in Chrome DevTools:
# Application tab → Service Workers
# Application tab → Manifest
# Lighthouse tab → PWA audit
```

**Cache Versioning**:

```javascript
// Update version on every deployment
const CACHE_NAME = "humbug-quiz-v2"; // Increment!
const RUNTIME_CACHE = "humbug-quiz-runtime-v2";
```

**Common Issues**:

- ❌ Service worker not updating → Check cache version
- ❌ Offline not working → Check precache assets list
- ❌ Old content showing → Clear browser cache
- ✅ Use `skipWaiting()` for immediate updates
- ✅ Always test on actual devices

### PWA Installation

**Desktop**: Install icon in browser address bar  
**Mobile Android**: "Add to Home Screen" in Chrome menu  
**Mobile iOS**: Share → "Add to Home Screen"

**Manifest Requirements**:

- ✅ `manifest.json` with name, icons, display mode
- ✅ Icons: 192x192, 512x512 (PNG) + SVG
- ✅ `start_url` and `background_color`
- ✅ Service worker registered

---

## 🔒 Security Considerations

### Content Security Policy (CSP)

**Current Configuration** (from `vercel.json`):

```json
{
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; media-src 'self';"
    }
  ]
}
```

**Why `'unsafe-inline'` is needed**:

- Vite's HMR (Hot Module Replacement) requires inline scripts in dev
- Consider stricter CSP for production builds

### XSS Prevention

**React's Built-in Protection**:

- JSX escapes content by default
- Use `dangerouslySetInnerHTML` only when absolutely necessary
- Sanitize user input if ever added

---

## 🎯 Accessibility (a11y)

### WCAG 2.1 AA Compliance

**Color Contrast Ratios**:

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Current colors meet AA standards (verified in PRD)

### Keyboard Navigation

**Essential Patterns**:

```tsx
// Tab order should be logical
<button tabIndex={0}>Primary Action</button>
<button tabIndex={1}>Secondary Action</button>

// Escape key to close modals
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, []);

// Focus management for dialogs
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);
```

### Screen Reader Support

**ARIA Labels**:

```tsx
// Buttons without visible text
<button aria-label="Play audio">
  <PlayIcon />
</button>

// Status updates
<div aria-live="polite">
  {isPlaying ? "Now playing" : "Paused"}
</div>

// Hidden content
<span className="sr-only">
  Additional context for screen readers
</span>
```

---

## 🐛 Common Pitfalls & Solutions

### 1. Framer Motion Flickering

**Problem**: Animations flicker on page load
**Solution**: Use `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}`

### 2. localStorage Quota Exceeded

**Problem**: Too much data in localStorage
**Solution**: Implement cleanup strategy

```tsx
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === "QuotaExceededError") {
    localStorage.clear();
    localStorage.setItem(key, value);
  }
}
```

### 3. CSS z-index Issues

**Solution**: Establish z-index scale

```css
:root {
  --z-background: 0;
  --z-content: 10;
  --z-header: 100;
  --z-modal: 1000;
  --z-tooltip: 10000;
}
```

### 4. Tailwind Class Conflicts

**Problem**: Classes overriding each other unpredictably
**Solution**: Use `tailwind-merge` utility

```tsx
import { cn } from "@/lib/utils";

<div className={cn("bg-red-500", props.className)} />;
```

### 5. Mobile Safari Viewport Height

**Problem**: `100vh` includes address bar on mobile Safari
**Solution**: Use `min-h-screen` from Tailwind or `100dvh` (dynamic viewport height)

---

## 📦 Deployment Checklist

### Pre-Deployment

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run preview`
- [ ] Verify all images are optimized
- [ ] Check bundle sizes with `npm run build -- --analyze`
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Verify all links work
- [ ] Check console for errors
- [ ] Validate HTML (https://validator.w3.org/)
- [ ] Test with slow network (Chrome DevTools throttling)

### Post-Deployment

- [ ] Verify DNS propagation
- [ ] Test HTTPS certificate
- [ ] Check meta tags (Open Graph, Twitter Cards)
- [ ] Verify favicon displays correctly
- [ ] Test analytics (if implemented)
- [ ] Monitor error tracking (Sentry, etc.)
- [ ] Check Lighthouse scores (Performance, Accessibility, Best Practices, SEO)

---

## 🏗️ Serverless Architecture

### Vercel Function Limits

**Critical**: Vercel Free/Hobby plan has a **12 serverless function limit**. We must consolidate API endpoints to avoid hitting this limit.

**Current Usage** (7/12 functions):

1. `/api/auth/google.ts` - OAuth initiation
2. `/api/auth/callback.ts` - OAuth callback handler
3. `/api/auth/session.ts` - Session validation
4. `/api/auth/logout.ts` - Logout handler
5. `/api/admin.ts` - **Unified admin API** (handles all admin operations)
6. `/api/question-sets.ts` - Question pack listing
7. `/api/questions/[slug].ts` - Dynamic question pack data

**5 function slots remaining** for future features.

### Unified Admin API Pattern

Instead of creating separate endpoints for each admin resource, we use a **single serverless function** with query parameter routing:

```typescript
// Single file: /api/admin.ts
// Endpoint pattern: /api/admin?resource={resource}&action={action}&id={id}

// Example requests:
GET  /api/admin?resource=users&page=1&limit=20
POST /api/admin?resource=users              (body: user data)
PUT  /api/admin?resource=users&id=123       (body: updated data)
DELETE /api/admin?resource=users&id=123

GET  /api/admin?resource=questions&set_id=2&category=tourism
POST /api/admin?resource=questions          (body: question + answers)
PUT  /api/admin?resource=questions&id=456

GET  /api/admin?resource=activity&action_type=UPDATE&page=1
GET  /api/admin?resource=dashboard-stats
```

**Benefits:**

- ✅ Only 1 function slot used for entire admin panel
- ✅ Centralized authentication/authorization
- ✅ Consistent error handling and logging
- ✅ Shared database connection pooling
- ✅ Unified activity logging
- ✅ Easy to extend with new resources

**Implementation Pattern:**

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Validate admin session
  const admin = await validateAdminSession(req, res);
  if (!admin) return; // 401 response sent automatically

  // 2. Route by resource
  const { resource } = req.query;

  switch (resource) {
    case "users":
      return handleUsers(req, res, admin);
    case "questions":
      return handleQuestions(req, res, admin);
    case "packs":
      return handlePacks(req, res, admin);
    case "activity":
      return handleActivity(req, res, admin);
    case "dashboard-stats":
      return handleDashboardStats(req, res, admin);
    default:
      return res.status(400).json({ error: "Invalid resource" });
  }
}

// Each handler implements CRUD operations
async function handleUsers(req, res, admin) {
  switch (req.method) {
    case "GET":
      return getUsers(req, res);
    case "POST":
      await logActivity(admin.id, "CREATE", "user", null, req.body, req);
      return createUser(req, res);
    case "PUT":
      await logActivity(
        admin.id,
        "UPDATE",
        "user",
        req.query.id,
        req.body,
        req
      );
      return updateUser(req, res);
    case "DELETE":
      await logActivity(admin.id, "DELETE", "user", req.query.id, {}, req);
      return deleteUser(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
```

### Database Connection Management

**Neon PostgreSQL** best practices:

```typescript
import { Pool } from "@neondatabase/serverless";

// Create pool per request (serverless doesn't keep connections)
const pool = new Pool({
  connectionString: process.env.POSTGRES_POSTGRES_URL,
});

try {
  // Execute queries
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  // Always use parameterized queries (prevents SQL injection)
  await pool.query(
    "INSERT INTO questions (question_en, question_hu) VALUES ($1, $2)",
    [questionEn, questionHu]
  );
} catch (error) {
  console.error("Database error:", error);
  res.status(500).json({ error: "Database operation failed" });
} finally {
  // CRITICAL: Always close the pool
  await pool.end();
}
```

**Key Points:**

- ✅ Create new pool for each request
- ✅ Always use parameterized queries ($1, $2, etc.)
- ✅ Always close pool in `finally` block
- ✅ Handle errors gracefully
- ❌ Never concatenate user input into SQL strings

---

## 👑 Admin Panel Architecture

### Overview

The admin panel is a comprehensive content management system with the following structure:

```
/admin              → Dashboard (stats, charts, recent activity)
/admin/users        → User management (CRUD, role assignment)
/admin/questions    → Question management (CRUD, answers, packs)
/admin/packs        → Question pack management (CRUD, metadata)
/admin/activity     → Activity log (audit trail, filtering)
```

### Authentication & Authorization

**Role-Based Access Control (RBAC):**

```typescript
// Database schema
users {
  id: integer
  name: text
  email: text (unique)
  picture: text
  role: text (default: 'user')  // 'user' | 'admin'
  is_active: boolean (default: true)
}

// Validation middleware
async function validateAdminSession(req, res) {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const pool = new Pool({ connectionString: process.env.POSTGRES_POSTGRES_URL });

  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1 AND role = $2 AND is_active = true",
    [decoded.userId, "admin"]
  );

  await pool.end();

  if (result.rows.length === 0) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  return result.rows[0]; // Return admin user object
}
```

**Session Flow:**

1. User logs in via Google OAuth → `/api/auth/callback`
2. Server creates JWT with `userId`, `email`, `role`
3. JWT stored in HTTP-only cookie (7-day expiration)
4. Admin pages call `/api/auth/session` to validate
5. Admin API checks `role = 'admin'` on every request
6. Unauthorized users get 403 Forbidden

### Activity Logging System

**Purpose**: Track all admin actions for audit and compliance.

**Database Schema:**

```sql
CREATE TABLE admin_activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,  -- 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
  entity_type TEXT NOT NULL,  -- 'user' | 'question' | 'pack' | 'auth'
  entity_id INTEGER,          -- ID of affected entity (null for LOGIN/LOGOUT)
  details JSONB,              -- Changed data, previous values, etc.
  ip_address TEXT,            -- User's IP address
  user_agent TEXT,            -- Browser/device info
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON admin_activity_log(user_id);
CREATE INDEX idx_activity_created ON admin_activity_log(created_at DESC);
CREATE INDEX idx_activity_type ON admin_activity_log(action_type);
```

**Logging Function:**

```typescript
async function logActivity(
  userId: number,
  actionType: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT",
  entityType: "user" | "question" | "pack" | "auth",
  entityId: number | null,
  details: any = {},
  req?: VercelRequest
) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    await pool.query(
      `INSERT INTO admin_activity_log (user_id, action_type, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        actionType,
        entityType,
        entityId,
        JSON.stringify(details),
        req?.headers["x-forwarded-for"] || req?.headers["x-real-ip"] || null,
        req?.headers["user-agent"] || null,
      ]
    );
  } catch (error) {
    // Don't throw - activity logging failure shouldn't break operations
  } finally {
    await pool.end();
  }
}

// Usage examples:
await logActivity(
  admin.id,
  "CREATE",
  "question",
  questionId,
  {
    question_en: "New question text",
    category: "tourism",
    set_id: 2,
  },
  req
);

await logActivity(
  admin.id,
  "UPDATE",
  "user",
  userId,
  {
    changes: { role: "admin" },
    previous: { role: "user" },
  },
  req
);

await logActivity(
  admin.id,
  "DELETE",
  "pack",
  packId,
  {
    name: "Deleted Pack Name",
    question_count: 15,
  },
  req
);
```

**Frontend Display:**

The Activity page shows logs with:

- Admin profile picture, name, email
- Action type badge (CREATE=green, UPDATE=blue, DELETE=red)
- Entity type badge
- Action description (e.g., "John Doe updated question #42")
- Relative timestamp ("2 hours ago")
- Expandable details JSON viewer
- Filters: action type, entity type, admin, date range
- Pagination

### Dashboard Analytics

**Real-time Statistics:**

```typescript
async function getDashboardStats() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // Total users + weekly change
    const usersResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE is_active = true"
    );
    const usersWeekResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
    );

    // Total questions + weekly additions
    const questionsResult = await pool.query(
      "SELECT COUNT(*) as total FROM questions WHERE is_active = true"
    );

    // Total plays (sum of times_played)
    const playsResult = await pool.query(
      "SELECT COALESCE(SUM(times_played), 0) as total FROM questions"
    );

    // Recent activity count (24 hours)
    const activityResult = await pool.query(
      "SELECT COUNT(*) as total FROM admin_activity_log WHERE created_at >= NOW() - INTERVAL '24 hours'"
    );

    // Chart data: 30 days of user growth and play counts
    const chartResult = await pool.query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        d.date::text,
        (SELECT COUNT(*) FROM users WHERE created_at::date <= d.date) as users,
        COALESCE((SELECT SUM(times_played) FROM questions WHERE created_at::date = d.date), 0) as plays
      FROM dates d
      ORDER BY d.date
    `);

    return {
      stats: {
        totalUsers,
        totalQuestions,
        totalPlays,
        totalSolved,
        recentActivities,
        usersChange,
        questionsChange,
        playsChange,
      },
      chartData: chartResult.rows, // [{ date: '2025-01-20', users: 45, plays: 123 }, ...]
    };
  } finally {
    await pool.end();
  }
}
```

**Chart Visualization:**

Using `recharts` library to display 30-day trends:

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

<ResponsiveContainer width="100%" height={400}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line dataKey="users" stroke="#eab308" strokeWidth={2} name="Total Users" />
    <Line
      dataKey="plays"
      stroke="hsl(142, 76%, 36%)"
      strokeWidth={2}
      name="Total Plays"
    />
  </LineChart>
</ResponsiveContainer>;
```

### UI/UX Patterns

**Admin Layout:**

```tsx
// Desktop: Horizontal navigation bar
<nav className="flex items-center gap-8 px-6 py-4 border-b">
  <div className="flex gap-6">
    <NavLink to="/admin">Dashboard</NavLink>
    <NavLink to="/admin/users">Users</NavLink>
    <NavLink to="/admin/questions">Questions</NavLink>
    <NavLink to="/admin/packs">Packs</NavLink>
    <NavLink to="/admin/activity">Activity</NavLink>
  </div>
  <div className="ml-auto flex items-center gap-3">
    <Avatar>{user.name}</Avatar>
    <Button onClick={logout}>Logout</Button>
  </div>
</nav>

// Mobile: Collapsible sidebar
<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
  <SheetTrigger>
    <Menu className="h-6 w-6" />
  </SheetTrigger>
  <SheetContent side="left">
    <nav className="flex flex-col gap-4">
      {/* Same nav links */}
    </nav>
  </SheetContent>
</Sheet>
```

**Data Table Pattern:**

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Badge variant={user.role === "admin" ? "default" : "outline"}>
            {user.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={user.is_active ? "success" : "destructive"}>
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(user)}
                className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;

{
  /* Pagination */
}
<div className="flex items-center justify-between mt-4">
  <p className="text-sm text-muted-foreground">
    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
    {total}
  </p>
  <div className="flex gap-2">
    <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
      Previous
    </Button>
    <Button onClick={() => setPage(page + 1)} disabled={page * limit >= total}>
      Next
    </Button>
  </div>
</div>;
```

**Edit Dialog Pattern:**

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Edit User</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value })
            }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Code Cleanup Best Practices

**Console Logs:**

- ❌ Remove all `console.log()` from production code
- ✅ Keep `console.error()` for actual error handling (but handle gracefully)
- ✅ Use toast notifications for user feedback instead

**Before:**

```typescript
try {
  console.log("Fetching users...");
  const response = await fetch("/api/admin?resource=users");
  const data = await response.json();
  console.log("Users data:", data);
  setUsers(data.users);
} catch (error) {
  console.error("Error fetching users:", error);
  toast.error("Failed to fetch users");
}
```

**After:**

```typescript
try {
  const response = await fetch("/api/admin?resource=users");
  const data = await response.json();
  setUsers(data.users);
} catch (error) {
  toast.error("Failed to fetch users");
}
```

**Temporary Files:**

- Remove `.md` planning documents after implementation
- Keep only essential documentation (README, SCHEMA_DOCUMENTATION, etc.)
- Remove unused migration scripts after consolidation
- Clean up test files that are no longer relevant

---

## 🔄 Version Control Best Practices

### Commit Message Format

Follow conventional commits:

```
feat: add background music player
fix: resolve mobile viewport height issue
docs: update README with installation steps
style: format code with prettier
refactor: simplify audio player logic
perf: optimize image loading
test: add unit tests for QuestionCard
chore: update dependencies
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

---

## 📚 Useful Resources

### Documentation

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [i18next Documentation](https://www.i18next.com/)

### Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [WAVE](https://wave.webaim.org/) - Accessibility testing
- [BundlePhobia](https://bundlephobia.com/) - Package size analysis
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Color Contrast Checker](https://coolors.co/contrast-checker)

---

## 💡 Future Considerations

### Potential Enhancements

1. **Progressive Web App (PWA)**

   - Add service worker for offline support
   - Create app manifest
   - Enable install prompt

2. **Analytics**

   - Add Google Analytics or Plausible
   - Track user interactions with questions
   - Monitor audio player usage

3. **Performance Monitoring**

   - Integrate Sentry for error tracking
   - Add performance monitoring
   - Track Core Web Vitals

4. **Enhanced Accessibility**

   - Add high contrast theme
   - Implement reduced motion preference
   - Add skip-to-content link

5. **Internationalization Expansion**
   - Add more languages (German, French, etc.)
   - Implement RTL support for Arabic, Hebrew
   - Add currency/number formatting

---

## 📝 Notes for AI Agents

### When Modifying This Project

1. **Always check `agents.md` first** for project-specific guidelines
2. **Test on mobile** before considering a feature complete
3. **Update translations** in both `hu.json` and `en.json`
4. **Follow existing patterns** for consistency
5. **Document new learnings** by updating this file
6. **Mind the Vercel function limit** (7/12 used, 5 remaining)
7. **Log admin actions** using the `logActivity()` function
8. **Clean up console.log statements** before committing
9. **Use parameterized queries** for all database operations
10. **Always close database pools** in `finally` blocks

### Common AI Assistant Mistakes to Avoid

- ❌ Assuming browser APIs work the same on mobile
- ❌ Forgetting to update both language files
- ❌ Not testing with actual devices
- ❌ Overriding Tailwind with inline styles
- ❌ Ignoring accessibility requirements
- ❌ Adding dependencies without checking bundle size
- ❌ Creating new serverless functions instead of using unified API
- ❌ Forgetting to log admin actions for audit trail
- ❌ Not closing database connections (memory leaks!)
- ❌ Using string concatenation for SQL queries (SQL injection!)
- ❌ Leaving console.log statements in production code
- ❌ Not validating admin role before executing admin operations

### Admin Panel Development Checklist

When adding new admin features:

- [ ] Use `/api/admin.ts` unified endpoint (don't create new functions)
- [ ] Validate admin session with `validateAdminSession()`
- [ ] Log actions with `logActivity(adminId, actionType, entityType, entityId, details, req)`
- [ ] Use parameterized queries (`$1`, `$2`, etc.)
- [ ] Close database pool in `finally` block
- [ ] Add pagination for list endpoints (default: 20 items/page)
- [ ] Include search and filter capabilities
- [ ] Add loading states (skeleton loaders)
- [ ] Show toast notifications for success/error
- [ ] Update activity log to handle new entity types
- [ ] Test with non-admin user (should get 403 Forbidden)
- [ ] Remove all console.log statements
- [ ] Update dashboard stats if applicable

### Prompt Engineering Tips

When asking for help:

- ✅ Mention you're working on a React + TypeScript + Vite project
- ✅ Specify if it's for mobile or desktop
- ✅ Include relevant code context
- ✅ Mention if internationalization is affected
- ✅ Ask for explanations, not just code
- ✅ Mention if it's admin panel related (role checks required)
- ✅ Specify if database operations are involved (connection pooling)
- ✅ Note the Vercel function limit constraint

---

<div align="center">

**Last Updated**: October 2025

**Project Status:**

- ✅ Core quiz game functionality complete
- ✅ Google OAuth authentication (fast returning user login)
- ✅ Role-based access control (free/premium/admin/creator)
- ✅ Question pack system with dynamic filtering
- ✅ Skinning system (standard/premium/fire themes)
- ✅ Admin panel with full CRUD operations
- ✅ Activity logging and audit trail
- ✅ Dashboard analytics with charts
- ✅ VIP badge for admin-only packs
- ✅ PWA support with offline functionality
- ✅ i18n support (English & Hungarian)
- ✅ Organized project structure (scripts/, legacy/)
- ✅ Production-ready deployment on Vercel

**Architecture Highlights:**

- JWT-based authentication with httpOnly cookies
- PostgreSQL (Neon) with parameterized queries
- Centralized skin configuration system
- Unified admin API endpoint
- React + TypeScript + Vite + Tailwind CSS
- shadcn/ui components + Framer Motion animations

_This document should be updated as the project evolves_

</div>
