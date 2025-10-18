# 🎲 HUMBUG! - Quiz Party Game Landing Page

![HUMBUG! Banner](./src/assets/images/humbug-mood.png)

**FAKE IT TILL YOU WIN IT**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://humbug.hu)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

> A captivating, interactive web application for HUMBUG! - an experimental quiz party game that combines trivia knowledge, strategic thinking, and psychological bluffing. This landing page serves as both a showcase and a game master companion tool.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Game Concept](#-game-concept)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Development](#-development)
- [Design Philosophy](#-design-philosophy)
- [Internationalization](#-internationalization)
- [Progressive Web App](#-progressive-web-app)
- [Deployment](#-deployment)
- [Credits](#-credits)
- [License](#-license)

---

## 🎯 Overview

**HUMBUG!** is an innovative quiz party game designed for 3-8 players (age 12+) that puts a unique twist on traditional trivia games. This web application provides:

- 🎵 **Background Music Player** - Looping theme music with smart controls
- 🎤 **Interactive Audio Rules** - Complete game explanations in Hungarian and English
- 🃏 **Complete Question Database** - 28 quiz questions across 6 diverse categories
- 📦 **Multiple Quiz Packs** - FREE (4), International (18), Hungarian (6) question packs
- 🔐 **Google OAuth Authentication** - Secure login for premium content access
- 🎨 **Game Show Aesthetics** - "Who Wants to be a Millionaire" inspired design
- 🌐 **Bilingual Support** - Full Hungarian/English localization
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ♿ **Accessibility Features** - Keyboard navigation, ARIA labels, screen reader support
- 🗄️ **PostgreSQL Database** - Neon serverless database for question storage
- 🚀 **Vercel Deployment** - Production-ready deployment with automatic CI/CD

---

## 🎮 Game Concept

### Core Mechanics

HUMBUG! transforms traditional quiz games by introducing a **bluffing element**. Players take turns answering open-ended questions with multiple correct answers. The catch? You can bluff with a wrong answer, hoping others won't challenge you.

**When someone calls "HUMBUG!" on your answer:**

- ✅ **You were right** → The challenger loses a life
- ❌ **You were wrong** → You lose a life
- 🎯 **Successful challenge** → The challenger earns a "pass" token

The game continues until only one player remains "alive" - requiring both knowledge and psychological insight to win.

### What Makes HUMBUG! Unique

- **Knowledge + Psychology**: Success requires both trivia knowledge AND the ability to read opponents
- **Strategic Depth**: Decide when to bluff, when to challenge, and when to pass
- **Social Dynamics**: Creates memorable moments of tension, laughter, and surprise
- **Quick to Learn**: 5-minute rule explanation, yet endlessly replayable
- **No Equipment Needed**: Just this web app and your wits!

---

## ✨ Key Features

### 🎪 Hero Section

- Dramatic entrance with smooth fade-in animations and custom easing curves
- "Who Wants to be a Millionaire" inspired golden gradient theme
- Background image positioned at 40% from top for optimal visual impact
- Interactive CTA button with hover effects (scales, border highlight)
- Language switcher in top-right corner (Hungarian 🇭🇺 / English 🇬🇧)

### 📋 Interactive Game Rules

- **6 comprehensive rule sections**:
  1. **Preparation** - No equipment needed
  2. **Starting the Game** - Game master role and question format
  3. **Players' Answers** - Mandatory answers and bluffing mechanics
  4. **The "Humbug!"** - Challenge mechanics
  5. **Victory and Defeat** - Lives, passes, and winning conditions
  6. **Alternative Game Mode** - Multi-challenge variant for larger groups
- **Audio narration** available in both Hungarian and English
- **Custom audio player** with:
  - Play/pause controls
  - Seekable progress bar
  - Volume control with mute button
  - Time display (current/total)
  - Accessible keyboard controls

### 🎵 Background Music Player

- Looping HUMBUG! main theme for ambiance
- Smart controls that appear on hover or when playing
- Default 30% volume for non-intrusive background atmosphere
- Volume slider with percentage display
- Animated music note icon when playing
- Status messages: "Now Playing..." / "Click to set the mood"

### 🃏 Question Card Gallery

- **22+ complete questions** across 15 categories:
  - Tourism, Technology, Culture & History, Entertainment
  - Gastronomy, Sports, Travel, and more
- **Interactive flip cards** with smooth 3D rotation animation
- **Answer management system**:
  - Click answers to mark them as "used" (green highlighting)
  - Visual counter showing selected/total format (e.g., "3/15")
  - Persistent state via localStorage
- **Smart layout system**: Automatically adjusts columns (1-4) based on answer count
- **Source attribution**: Clickable links to Wikipedia, IMDb, and other authoritative sources
- **Diagonal watermark**: "HUMBUG!" text on card backs for brand recognition
- **Game master helper text**: "Game master? Click for answers!"

### 🎨 Design Features

- **Typography**: Space Grotesk font family (self-hosted for network compatibility)
  - 5 weights available: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Color Scheme**: Deep navy background with golden yellow accents
  - Primary: Deep Navy `oklch(0.15 0.1 240)` - Authority and intelligence
  - Accent: Rich Gold `oklch(0.75 0.15 85)` - Highlights and success states
  - Bright Gold: `oklch(0.85 0.18 90)` - High-energy CTAs
- **Animations**:
  - Studio lighting effects with animated radial gradients
  - Scroll-triggered entrance animations
  - Smooth card flips and hover states
  - Floating decorative elements
- **Responsive Design**:
  - Mobile: Single column, touch-friendly controls (44px minimum)
  - Tablet: 2-column grid, optimized spacing
  - Desktop: Multi-column layouts, enhanced animations

### 🌐 Internationalization

- **Full bilingual support** (Hungarian 🇭🇺 / English 🇬🇧)
- **Language switcher** in hero section header
- **Persistent language preference** stored in localStorage
- **Complete translations** for:
  - All UI text and navigation
  - Game rules and instructions
  - 22+ questions with all answers
  - Category names and labels
- **Localized formatting**: Number formats, dates, etc.
- **Automatic language detection** based on browser preferences

### 📱 Progressive Web App (PWA)

- **Offline Support**: App works without internet after first visit
- **Installable**: Add to home screen on mobile/desktop
- **Automatic Updates**: Hourly checks for new versions
- **Smart Caching**: Cache-first strategy with network fallback
- **Service Worker**: Version-controlled asset caching
- **Update Notifications**: User-friendly prompts for new versions
- **Manifest**: Full PWA configuration with icons and theme colors

---

## 🛠️ Technology Stack

### Core Technologies

| Technology        | Version | Purpose                 |
| ----------------- | ------- | ----------------------- |
| **React**         | 18.3.1  | UI Component Framework  |
| **TypeScript**    | 5.5.3   | Static Type Safety      |
| **Vite**          | 6.3.6   | Build Tool & Dev Server |
| **Tailwind CSS**  | 4.1.11  | Utility-First Styling   |
| **Framer Motion** | 12.0.0  | Animation Library       |

### UI Components & Libraries

- **Radix UI**: Accessible, unstyled component primitives
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-tabs` - Tab navigation
  - `@radix-ui/react-separator` - Visual dividers
- **Phosphor Icons**: Modern, clean icon library (Play, Pause, MusicNotes, etc.)
- **Class Variance Authority (CVA)**: Type-safe component variant management
- **Tailwind Merge**: Intelligent class merging to prevent conflicts
- **clsx**: Conditional className utility

### Internationalization

- **i18next** (24.2.1): Core internationalization framework
- **react-i18next** (15.2.3): React-specific i18n bindings
- **i18next-browser-languagedetector** (8.0.2): Automatic language detection

### Development Tools

- **ESLint**: Code quality and consistency enforcement
- **TypeScript Compiler**: Static type checking
- **Vite Plugin React**: Fast refresh and React optimizations
- **PostCSS**: CSS processing and optimization

### Fonts

- **Space Grotesk**: Self-hosted game show typography
  - Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
  - Format: TTF (TrueType Font)
  - Location: `public/fonts/`
  - Purpose: Network compatibility (works on restricted networks without external CDN)

### Backend & Database

- **Neon PostgreSQL**: Serverless PostgreSQL database
  - `@neondatabase/serverless` (0.10.6): Serverless-optimized database client
  - Stores user data, question packs, and authentication sessions
- **Vercel Serverless Functions**: API endpoints in `api/` folder
  - Google OAuth authentication flow
  - Question pack management
  - Session validation
- **JWT Authentication**: Secure token-based authentication
  - `jsonwebtoken` (9.0.2): JWT token creation and validation
  - `cookie` (1.0.2): HTTP-only cookie management
  - 7-day session expiration

---

## 🔐 Authentication & Environment Strategy

### OAuth Flow Architecture

This application uses **dynamic domain detection** for Google OAuth to ensure the authentication flow works correctly across all environments without manual configuration.

#### How It Works

Instead of relying on environment variables that may be misconfigured, the auth endpoints detect the current domain from HTTP request headers:

```typescript
// Dynamically detect the current domain from request headers
const host = req.headers.host || "localhost:5000";
const protocol = host.includes("localhost") ? "http" : "https";
const appUrl = `${protocol}://${host}`;
const redirectUri = `${appUrl}/api/auth/callback`;
```

This ensures:

- ✅ Production (`humbug.hu`) stays on production
- ✅ Pre-production (`humbug-quiz.vercel.app`) stays on pre-prod
- ✅ Local development (`localhost:5000`) stays local
- ✅ No environment variable configuration needed for domain detection

### Environment Configuration

#### Branch Strategy

| Branch   | Environment    | Domain                               | Purpose                |
| -------- | -------------- | ------------------------------------ | ---------------------- |
| `master` | **Production** | https://humbug.hu                    | Live production site   |
| `main`   | **Pre-Prod**   | https://humbug-quiz.vercel.app       | Testing before release |
| Other    | **Preview**    | `https://[branch]-[hash].vercel.app` | Feature testing        |

#### Required Environment Variables

Create a `.env.local` file for local development:

```bash
# Database Configuration
POSTGRES_POSTGRES_URL="postgresql://user:password@host/database"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-secure-random-secret"

# Optional: App URL (auto-detected if not set)
# NEXT_PUBLIC_APP_URL="http://localhost:5000"
```

**For Vercel deployment**, set these environment variables in the Vercel dashboard for each environment. See [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md) for detailed setup instructions.

### Google OAuth Configuration

#### Required Redirect URIs

Add all three environments to your Google Cloud Console OAuth Client:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:

```
https://humbug.hu/api/auth/callback                    (Production)
https://humbug-quiz.vercel.app/api/auth/callback       (Pre-Production)
http://localhost:5000/api/auth/callback                (Local Development)
```

#### OAuth Endpoints

| Endpoint             | Purpose                            | Method |
| -------------------- | ---------------------------------- | ------ |
| `/api/auth/google`   | Initiates OAuth flow               | GET    |
| `/api/auth/callback` | Handles OAuth callback from Google | GET    |
| `/api/auth/session`  | Validates current session          | GET    |
| `/api/auth/logout`   | Clears authentication cookie       | POST   |

#### Authentication Flow

1. **User clicks "Login with Google"**

   - Frontend calls `/api/auth/google`
   - Server detects domain from `req.headers.host`
   - Redirects to Google with correct `redirect_uri`

2. **Google redirects back to app**

   - Google calls `/api/auth/callback?code=...`
   - Server exchanges code for user info
   - Creates JWT token with user data
   - Stores user in database (if new)
   - Sets HTTP-only cookie with JWT
   - Redirects to app homepage

3. **Session validation**

   - Frontend calls `/api/auth/session` on mount
   - Server validates JWT from cookie
   - Returns `{ authenticated: true, user: {...} }`

4. **Logout**
   - Frontend calls `/api/auth/logout`
   - Server clears auth cookie
   - Redirects to homepage

### Local Development with OAuth

For local development, the project includes a custom Vite plugin (`apiRoutesPlugin` in `vite.config.ts`) that handles API routes during development:

```typescript
// vite.config.ts includes middleware for:
// - /api/auth/google: OAuth initiation
// - /api/auth/callback: OAuth callback handler
// - /api/auth/session: Session validation
// - /api/auth/logout: Logout handler
// - /api/question-sets: Question pack listing
// - /api/questions/:slug: Question pack data
```

**To run with OAuth locally:**

1. Ensure `.env.local` has all required variables
2. Add `http://localhost:5000/api/auth/callback` to Google OAuth redirect URIs
3. Run `npm run dev`
4. OAuth will work seamlessly with dynamic domain detection

### Security Features

- ✅ **HTTP-only cookies**: JWT token not accessible via JavaScript (XSS protection)
- ✅ **Secure flag**: Cookies only sent over HTTPS in production
- ✅ **SameSite=Lax**: CSRF protection
- ✅ **7-day expiration**: Automatic session timeout
- ✅ **Database persistence**: User data stored securely in Neon PostgreSQL
- ✅ **Dynamic domain detection**: Prevents redirect URI mismatches

### Troubleshooting OAuth

**Issue: "redirect_uri_mismatch" error**

- Verify all three redirect URIs are added to Google Console
- Check that the domain matches exactly (no trailing slashes)
- Ensure Google OAuth Client ID is correct in environment variables

**Issue: OAuth works locally but not in Vercel**

- Check Vercel environment variables are set correctly
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present
- Ensure `JWT_SECRET` is configured in Vercel

**Issue: Session not persisting**

- Check browser allows cookies
- Verify cookie domain settings
- Check JWT_SECRET is consistent across deployments

For detailed deployment documentation, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

---

## 📁 Project Structure

```
humbug-quiz/
├── api/                             # Vercel serverless functions
│   └── auth/
│       ├── google.ts                # OAuth initiation endpoint
│       ├── callback.ts              # OAuth callback handler
│       ├── session.ts               # Session validation endpoint
│       └── logout.ts                # Logout endpoint
│   ├── question-sets.ts             # Question pack listing API
│   └── questions/
│       └── [slug].ts                # Question pack data API
│
├── database/                        # Database scripts & migrations
│   ├── schema.sql                   # Complete database schema
│   ├── reorganize-packs.js          # Question pack reorganization script
│   ├── rename-to-quiz.js            # Pack renaming to "Quiz Pack" terminology
│   ├── execute-cleanup.js           # Duplicate question cleanup (48→28)
│   ├── update-pack-descriptions.js  # Pack description updater
│   ├── show-pack-descriptions.js    # Pack description viewer
│   ├── verify-quiz-rename.js        # Verification script for renaming
│   ├── analyze-duplicates.js        # Duplicate question analyzer
│   ├── find-hun-questions.js        # Hungarian question identifier
│   ├── check-hun-questions.js       # Hungarian question ID checker
│   ├── migrate-two-packs.js         # Migration script for question packs
│   ├── fix-first-question.js        # Data fix scripts
│   ├── check-first-question.js      # Database verification
│   ├── README.md                    # Database documentation
│   ├── SCHEMA_DOCUMENTATION.md      # Schema reference
│   ├── STEP_BY_STEP_GUIDE.md        # Setup guide
│   └── translations/                # Question pack translations
│       ├── us-starter-pack-hu.js    # US pack with Hungarian translations
│       └── hun-starter-pack-en.js   # Hungarian pack with English translations
│
├── public/                          # Static assets
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service worker
│   └── fonts/                       # Self-hosted fonts
│       ├── SpaceGrotesk-Light.ttf
│       ├── SpaceGrotesk-Regular.ttf
│       ├── SpaceGrotesk-Medium.ttf
│       ├── SpaceGrotesk-SemiBold.ttf
│       └── SpaceGrotesk-Bold.ttf
│
├── src/
│   ├── assets/                      # Media assets
│   │   ├── audio/
│   │   │   ├── humbug-rules.mp3     # Hungarian rules audio
│   │   │   ├── humbug-rules-en.mp3  # English rules audio
│   │   │   └── humbug_main_theme.mp3 # Background music
│   │   └── images/
│   │       └── humbug-mood.png      # Hero background
│   │
│   ├── components/                  # React components
│   │   ├── AudioPlayer.tsx          # Custom audio player
│   │   ├── BackgroundMusicPlayer.tsx # Ambient music player
│   │   ├── CategoryFilter.tsx       # Question category filter
│   │   ├── CookieConsent.tsx        # Cookie consent banner
│   │   ├── InstallPrompt.tsx        # PWA install prompt
│   │   ├── LanguageSwitcher.tsx     # Language toggle
│   │   ├── LoginButton.tsx          # Google OAuth login
│   │   ├── PrivacyPolicy.tsx        # Privacy policy modal
│   │   ├── QuestionCard.tsx         # Flip card component
│   │   ├── QuestionPackSelector.tsx # Question pack switcher
│   │   └── ui/                      # Radix UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── separator.tsx
│   │       └── ... (30+ components)
│   │
│   ├── context/                     # React context providers
│   │   └── AuthContext.tsx          # Authentication state management
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-mobile.ts            # Mobile detection hook
│   │   └── useAuth.ts               # Authentication hook
│   │
│   ├── lib/                         # Utilities
│   │   └── utils.ts                 # Helper functions (cn, etc.)
│   │
│   ├── locales/                     # Internationalization
│   │   ├── en.json                  # English translations
│   │   └── hu.json                  # Hungarian translations
│   │
│   ├── styles/                      # CSS files
│   │   └── theme.css                # Custom theme variables
│   │
│   ├── App.tsx                      # Main application component
│   ├── ErrorFallback.tsx            # Error boundary component
│   ├── fonts.css                    # Self-hosted font declarations
│   ├── i18n.ts                      # i18next configuration
│   ├── index.css                    # Global styles & Tailwind base
│   ├── main.css                     # Main stylesheet imports
│   ├── main.tsx                     # Application entry point
│   └── vite-env.d.ts                # Vite type definitions
│
├── source_media/                    # Original source files
│   ├── Humbug_rules.txt
│   ├── Humbug_sample_questions_and_answers.txt
│   ├── questions_extracted.txt
│   └── Space_Grotesk/               # Font source files
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment variables (git-ignored)
├── components.json                  # shadcn/ui configuration
├── index.html                       # HTML entry point
├── LICENSE                          # MIT License
├── package.json                     # Dependencies and scripts
├── README.md                        # This file
├── runtime.config.json              # GitHub Spark runtime config
├── SECURITY.md                      # Security policy
├── spark.meta.json                  # Spark metadata
├── tailwind.config.js               # Tailwind configuration
├── theme.json                       # Theme configuration
├── tsconfig.json                    # TypeScript configuration
├── VERCEL_DEPLOYMENT.md             # Vercel deployment guide
├── VERCEL_ENV_VARS.md               # Environment variables reference
├── vercel.json                      # Vercel deployment config
└── vite.config.ts                   # Vite build configuration
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)
- **PostgreSQL Database** (Neon recommended for serverless)
- **Google OAuth Client** (from Google Cloud Console)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/szolzol/humbug-quiz.git
   cd humbug-quiz
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   # Database (get from Neon dashboard)
   POSTGRES_POSTGRES_URL="postgresql://user:password@host/database?sslmode=require"

   # Google OAuth (get from Google Cloud Console)
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # JWT Secret (generate with: openssl rand -base64 32)
   JWT_SECRET="your-secure-random-secret-key"

   # App URL (optional, auto-detected)
   NEXT_PUBLIC_APP_URL="http://localhost:5000"
   ```

   See [.env.example](./.env.example) for a complete template.

4. **Set up Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID (or use existing)
   - Add authorized redirect URI: `http://localhost:5000/api/auth/callback`
   - Copy Client ID and Client Secret to `.env.local`

5. **Initialize database** (optional - questions already in production DB)

   If setting up a new database instance:

   ```bash
   node database/migrate-two-packs.js
   ```

   This will create tables and populate with question packs.

6. **Start development server**

   ```bash
   npm run dev
   ```

7. **Open in browser**
   - Navigate to `http://localhost:5000`
   - Or access from network: `http://[your-ip]:5000`
   - Test Google login to verify OAuth setup

---

## 💻 Development

### Available Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start Vite dev server with hot reload |
| `npm run dev -- --host` | Expose dev server on local network    |
| `npm run build`         | Build production bundle to `dist/`    |
| `npm run preview`       | Preview production build locally      |
| `npm run lint`          | Run ESLint for code quality checks    |
| `npm run type-check`    | Run TypeScript compiler checks        |

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Edit files in `src/`
   - Hot reload will update browser automatically
   - Check console for TypeScript errors

3. **Test Responsiveness**

   - Mobile: Chrome DevTools (Cmd/Ctrl + Shift + M)
   - Tablet: 768px - 1024px breakpoints
   - Desktop: 1024px+ layouts

4. **Build for Production**

   ```bash
   npm run build
   npm run preview
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Key Development Notes

- **Mobile Viewport**: Always test on actual mobile devices, not just emulators
- **Font Loading**: Fonts are self-hosted in `public/fonts/` for network compatibility
- **Audio Files**: Keep audio files under 5MB for fast loading
- **i18n**: Add translations to both `en.json` and `hu.json` when adding new text
- **Animations**: Use Framer Motion's `viewport={{ once: true }}` to prevent re-triggering on scroll

---

## 🎨 Design Philosophy

### Experience Qualities

1. **Dramatic** - Creates the tension and excitement of a high-stakes quiz show
2. **Sophisticated** - Appeals to adults who enjoy intellectual party games
3. **Engaging** - Interactive elements and animations keep visitors exploring

### Design Principles

- **Visual Hierarchy**: Clear distinction between title (48px), headers (32px), and body (16px)
- **Color Psychology**:
  - Deep Navy = Authority and intelligence
  - Rich Gold = Success and achievement
  - Bright accents = Energy and excitement
- **Motion Design**: All animations serve a purpose - revealing, emphasizing, or guiding attention
- **Accessibility First**: WCAG 2.1 AA compliant with 4.5:1+ contrast ratios
- **Mobile-First**: Start with mobile, progressively enhance for larger screens

### Color System (Triadic Harmony)

Using three equally spaced colors on the color wheel:

| Color       | Value                 | Purpose               | Contrast |
| ----------- | --------------------- | --------------------- | -------- |
| Deep Navy   | `oklch(0.15 0.1 240)` | Background, authority | Base     |
| Rich Gold   | `oklch(0.75 0.15 85)` | Highlights, success   | 12.8:1 ✓ |
| Bright Gold | `oklch(0.85 0.18 90)` | CTAs, focus           | 8.9:1 ✓  |
| White       | `oklch(0.98 0 0)`     | Text                  | 15.2:1 ✓ |

### Typography Scale

- **H1 (Game Title)**: Space Grotesk Black / 48px / -0.02em letter-spacing
- **H2 (Section Headers)**: Space Grotesk Bold / 32px / normal spacing
- **H3 (Card Titles)**: Space Grotesk SemiBold / 24px / normal spacing
- **Body Text**: Space Grotesk Regular / 16px / 1.6 line-height
- **Buttons**: Space Grotesk Medium / 18px / uppercase

---

## 🌍 Internationalization

### Supported Languages

- **Hungarian (hu)** 🇭🇺 - Primary language
- **English (en)** 🇬🇧 - Secondary language

### Adding New Translations

1. **Edit locale files**

   - `src/locales/hu.json` - Hungarian
   - `src/locales/en.json` - English

2. **Use in components**

   ```tsx
   import { useTranslation } from "react-i18next";

   function MyComponent() {
     const { t } = useTranslation();
     return <h1>{t("hero.title")}</h1>;
   }
   ```

3. **Access nested translations**
   ```tsx
   const questions = t("allQuestions", { returnObjects: true });
   ```

### Translation Structure

```json
{
  "hero": {
    "title": "HUMBUG!",
    "subtitle": "Tagline",
    "description": "Description text"
  },
  "rules": {
    "audioTitle": "How to play?",
    "section1": { "title": "...", "content": "..." }
  },
  "allQuestions": [
    {
      "id": "1",
      "category": "travel",
      "question": "Question text?",
      "answers": ["Answer 1", "Answer 2"],
      "sourceName": "Wikipedia",
      "sourceUrl": "https://..."
    }
  ]
}
```

---

## � Progressive Web App

HUMBUG! is a fully functional **Progressive Web App** with offline support and installability.

### Features

- 🔌 **Offline Support**: Works without internet after first visit
- 📥 **Installable**: Add to home screen on any device
- 🔄 **Auto-Updates**: Checks for new versions every hour
- ⚡ **Fast Loading**: Smart caching for instant page loads
- 🎨 **Native Look**: Runs in standalone mode (no browser UI)
- 📱 **Cross-Platform**: Works on Android, iOS, and desktop

### Installation

#### Mobile (Android/iOS)

1. Visit [humbug.hu](https://humbug.hu)
2. Tap browser menu (⋮ or share icon)
3. Select **"Add to Home Screen"**
4. App icon appears on home screen
5. Launch like any native app!

#### Desktop (Chrome/Edge)

1. Visit the site in browser
2. Look for install icon (⊕) in address bar
3. Click to install
4. App opens in standalone window
5. Access from Start Menu/Applications

### Technical Details

**Service Worker**: `public/sw.js`

- Cache-first strategy with network fallback
- Precaches: HTML, fonts, icons, manifest
- Runtime caches: JS, CSS, images
- Version-controlled cache management

**Manifest**: `public/manifest.json`

- Standalone display mode
- Golden theme color (#d4af37)
- Navy background (#15151f)
- Multiple icon sizes (192x192, 512x512, SVG)

**Update Mechanism**:

- Automatic update checks every hour
- User-friendly update notifications
- Non-intrusive "Update" or "Later" prompts
- Immediate apply with page reload

For detailed PWA documentation, see [PWA_IMPLEMENTATION.md](./PWA_IMPLEMENTATION.md).

---

## � Question Pack Management

### Current Question Pack Structure

The application now features a reorganized question pack system with three distinct packs:

| Pack              | Slug            | Questions | Access Level  | Description                                                                                  |
| ----------------- | --------------- | --------- | ------------- | -------------------------------------------------------------------------------------------- |
| **Free**          | `free`          | 4         | Public        | Free question pack available to visitor users - perfect for trying out the game              |
| **International** | `international` | 18        | Authenticated | Original "Humbug!" quiz questions including general knowledge and some US specific questions |
| **Hungarian**     | `hun-quiz-pack` | 6         | Authenticated | Hungary focused trivia covering the country with various topics                              |

**Total Questions**: 28 unique questions (down from 48 after duplicate removal)

### Pack Reorganization History

**October 2025**: Major database reorganization completed:

1. **Duplicate Removal**: Eliminated 20 duplicate questions (48 → 28 total)
2. **Pack Renaming**:
   - `us-starter-pack` → `international`
   - `hun-starter-pack` → `hun-quiz-pack`
3. **Terminology Update**: All "Starter Pack" / "Kezdőcsomag" → "Quiz Pack"
4. **Question Distribution**:
   - FREE pack: 4 exclusive questions (no overlap with premium packs)
   - HUN pack: 6 Hungarian-specific questions (identified by keyword search)
   - INT pack: 18 international/US questions (original US pack minus free questions)

### Database Scripts

Key database management scripts located in `database/`:

```bash
# View current pack descriptions
node database/show-pack-descriptions.js

# Update pack descriptions
node database/update-pack-descriptions.js

# Verify quiz pack renaming
node database/verify-quiz-rename.js

# Check for duplicate questions
node database/analyze-duplicates.js

# Reorganize question packs (already executed)
node database/reorganize-packs.js

# Clean up duplicate questions (already executed)
node database/execute-cleanup.js
```

### Pack Description Updates

Pack descriptions can be updated via database scripts. Current descriptions:

**FREE Pack**:

- EN: "Free question pack available to visitor users - perfect for trying out the game"
- HU: "Ingyenes kérdéscsomag látogatók számára - ideális a játék kipróbálásához"

**International Pack**:

- EN: "Original \"Humbug!\" quiz questions including general knowledge and some US specific questions"
- HU: "Eredeti \"Humbug!\" kérdések általános témakörökben, 1-2 USA specifikus kérdéssel"

**Hungarian Pack**:

- EN: "Hungary focused trivia covering the country with various topics"
- HU: "Magyarország témájú kvíz kérdések változatos témákban"

### Future: Admin Interface

An admin interface for managing question packs is planned for future development on the `main` branch:

- **Question Pack CRUD**: Create, edit, delete question packs
- **Question Management**: Add, edit, remove individual questions
- **Description Editor**: In-app editing of pack descriptions
- **Access Control**: Manage pack visibility and authentication requirements
- **Analytics**: Track pack usage and user engagement

---

## �🚀 Deployment

### Deployment Strategy

This project uses a **multi-environment deployment strategy** with Vercel:

| Environment    | Branch   | Domain                               | Purpose                |
| -------------- | -------- | ------------------------------------ | ---------------------- |
| **Production** | `master` | https://humbug.hu                    | Live production site   |
| **Pre-Prod**   | `main`   | https://humbug-quiz.vercel.app       | Testing before release |
| **Preview**    | Other    | `https://[branch]-[hash].vercel.app` | Feature testing        |

### Vercel Deployment (Recommended)

This project is optimized for Vercel with automatic deployments:

#### Initial Setup

1. **Connect Repository**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

2. **Configure Build Settings**

   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Production Branch**

   In Vercel Dashboard → Settings → Git:

   - Production Branch: `master`
   - This ensures `master` deploys to custom domain (humbug.hu)
   - `main` branch deploys to `humbug-quiz.vercel.app` (pre-prod)

4. **Configure Environment Variables**

   Add these in Vercel Dashboard → Settings → Environment Variables:

   **For ALL environments** (Production + Preview + Development):

   ```
   POSTGRES_POSTGRES_URL          (PostgreSQL connection string)
   GOOGLE_CLIENT_ID               (Google OAuth Client ID)
   GOOGLE_CLIENT_SECRET           (Google OAuth Secret)
   JWT_SECRET                     (Random secret for JWT signing)
   ```

   **Note**: `NEXT_PUBLIC_APP_URL` is **NOT required** - the app automatically detects the current domain from request headers.

   For detailed environment setup, see [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md).

5. **Configure Google OAuth Redirect URIs**

   Add all three environments to Google Cloud Console:

   ```
   https://humbug.hu/api/auth/callback
   https://humbug-quiz.vercel.app/api/auth/callback
   http://localhost:5000/api/auth/callback
   ```

6. **Deploy**
   - Push to `master` → Production deployment (humbug.hu)
   - Push to `main` → Pre-production deployment (humbug-quiz.vercel.app)
   - Push to other branches → Preview deployment

For comprehensive deployment documentation, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

### Custom Domain Setup

To configure a custom domain with Vercel:

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `humbug.hu`)
3. Configure DNS records with your registrar:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

- See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for complete instructions
- Includes registrar-specific setup (Forpsi, GoDaddy, etc.)
- Troubleshooting and verification steps

### Custom Headers (vercel.json)

The project includes a `vercel.json` with:

- CORS headers for fonts
- Cache control for static assets
- Security headers (CSP, X-Frame-Options)

### Manual Deployment

For non-Vercel hosting:

```bash
# Build production bundle
npm run build

# Test locally
npm run preview

# Deploy dist/ folder to your hosting provider
# Note: API routes require serverless function support
```

**Important**: The `/api` endpoints require serverless function support. If deploying to a static host, you'll need to set up a separate backend server for authentication and database access.

---

## 🏆 Credits

**Created by**: Szoleczki Zoltán & Beró Zsolt

**Other Projects**:

- **DarQba** - Mystery-solving party game

**Technology Partners**:

- Built with [Vite](https://vitejs.dev/)
- Powered by [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

Copyright © 2025 HUMBUG! All rights reserved.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Add TypeScript types for all new code
3. Test on mobile, tablet, and desktop
4. Update translations in both languages
5. Write meaningful commit messages

---

## 📞 Contact & Support

- **Live Demo**: [humbug.hu](https://humbug.hu)
- **Repository**: [github.com/szolzol/humbug-quiz](https://github.com/szolzol/humbug-quiz)
- **Issues**: [GitHub Issues](https://github.com/szolzol/humbug-quiz/issues)

---

<div align="center">

**Made with ❤️ for party game enthusiasts**

⭐ Star this repo if you find it useful!

</div>
