# 🎲 HUMBUG! - Quiz Party Game# 🎲 HUMBUG! - Quiz Party Game

![HUMBUG! Banner](./src/assets/images/humbug-mood.png)![HUMBUG! Banner](./src/assets/images/humbug-mood.png)

**FAKE IT TILL YOU WIN IT\*\***FAKE IT TILL YOU WIN IT\*\*

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://humbug.hu)[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://humbug.hu)

[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

> An interactive web application for HUMBUG! - a quiz party game that combines trivia knowledge, strategic bluffing, and psychological gameplay. Features online multiplayer, premium content, and a comprehensive admin panel.> A captivating, interactive web application for HUMBUG! - an experimental quiz party game that combines trivia knowledge, strategic thinking, and psychological bluffing. This landing page serves as both a showcase and a game master companion tool.

---

## 📖 Table of Contents## 📖 Table of Contents

- [Overview](#-overview)- [Overview](#-overview)

- [Key Features](#-key-features)- [Game Concept](#-game-concept)

- [Technology Stack](#-technology-stack)- [Key Features](#-key-features)

- [Project Structure](#-project-structure)- [Technology Stack](#-technology-stack)

- [Installation](#-installation)- [Project Structure](#-project-structure)

- [Development](#-development)- [Installation](#-installation)

- [Architecture](#-architecture)- [Development](#-development)

- [Deployment](#-deployment)- [Multiplayer Architecture](#-multiplayer-architecture)

- [Contributing](#-contributing)- [Admin Panel](#-admin-panel)

- [License](#-license)- [Design Philosophy](#-design-philosophy)

- [Internationalization](#-internationalization)

---- [Progressive Web App](#-progressive-web-app)

- [Deployment](#-deployment)

## 🎯 Overview- [Credits](#-credits)

- [License](#-license)

**HUMBUG!** is an innovative quiz party game for 3-8 players that puts a unique twist on traditional trivia games. This web application provides an interactive platform with:

---

- 🎮 **Real-time Multiplayer** - Play online with friends

- 🔐 **Google OAuth Authentication** - Secure login for premium features## 🎯 Overview

- 📦 **Multiple Quiz Packs** - Question sets with role-based access control

- 🎨 **Dynamic Skinning System** - Themed card designs (Standard, Premium, Fire)**HUMBUG!** is an innovative quiz party game designed for 3-8 players (age 12+) that puts a unique twist on traditional trivia games. This web application provides:

- 👑 **Admin Panel** - Comprehensive content management

- 🌐 **Bilingual Support** - Full Hungarian/English localization- � **Real-time Multiplayer** - Online gameplay with 2-10 players, polling-based architecture

- 📱 **Progressive Web App** - Installable, works offline- �🎵 **Background Music Player** - Looping theme music with smart controls

- ♿ **Accessibility Features** - WCAG 2.1 AA compliant- 🎤 **Interactive Audio Rules** - Complete game explanations in Hungarian and English

- 🃏 **Complete Question Database** - 28 quiz questions across 6 diverse categories

---- 📦 **Multiple Quiz Packs** - FREE (4), International (18), Hungarian (6) question packs with role-based access

- 🔐 **Google OAuth Authentication** - Secure login for premium content access

## ✨ Key Features- 👑 **Admin Panel** - Comprehensive content management system

- � **Fuzzy Answer Matching** - Tolerant answer validation with typo correction

### 🎪 Game Features- �🎨 **Game Show Aesthetics** - "Who Wants to be a Millionaire" inspired design

- 🌐 **Bilingual Support** - Full Hungarian/English localization

- **Interactive Question Cards** - Flip animations with multiple themed skins- 📱 **Fully Responsive** - Mobile-first design that works on all devices

- **Category Filtering** - Browse questions by category- ♿ **Accessibility Features** - Keyboard navigation, ARIA labels, screen reader support

- **Audio Player** - Background music and audio rule explanations- 🗄️ **PostgreSQL Database** - Neon serverless database for question storage and multiplayer state

- **Answer Validation** - Fuzzy matching for typo tolerance- 🚀 **Vercel Deployment** - Production-ready deployment with automatic CI/CD

- **Multiplayer Mode** - Real-time gameplay with polling-based architecture

---

### 🔐 Authentication & Access Control

## 🎮 Game Concept

- **Google OAuth 2.0** - Fast login with `select_account` prompt for returning users

- **Role-Based Access** - Free, Premium, Admin, and Creator roles### Core Mechanics

- **Pack Access Filtering** - Dynamic content filtering based on user role

- **Session Management** - JWT tokens with 7-day expiry in httpOnly cookiesHUMBUG! transforms traditional quiz games by introducing a **bluffing element**. Players take turns answering open-ended questions with multiple correct answers. The catch? You can bluff with a wrong answer, hoping others won't challenge you.

### 📦 Question Pack System**When someone calls "HUMBUG!" on your answer:**

- **Multiple Packs** - Free, International, Hungarian, Horror-themed special sets- ✅ **You were right** → The challenger loses a life

- **Access Levels** - `free`, `premium`, `admin_only` pack visibility- ❌ **You were wrong** → You lose a life

- **Dynamic Skins** - Each pack can have custom theme (standard/premium/fire)- 🎯 **Successful challenge** → The challenger earns a "pass" token

- **VIP Badge** - Special badge for admin-only packs in pack selector

The game continues until only one player remains "alive" - requiring both knowledge and psychological insight to win.

### 🎨 Skinning System

### What Makes HUMBUG! Unique

Three beautifully designed themes:

- **Knowledge + Psychology**: Success requires both trivia knowledge AND the ability to read opponents

- **Standard** - Classic yellow HUMBUG! theme- **Strategic Depth**: Decide when to bluff, when to challenge, and when to pass

- **Premium** - Purple-gold theme with shimmer effects- **Social Dynamics**: Creates memorable moments of tension, laughter, and surprise

- **Fire** - Red inferno theme with glow effects- **Quick to Learn**: 5-minute rule explanation, yet endlessly replayable

- **No Equipment Needed**: Just this web app and your wits!

All skins feature:

- Dynamic gradient backgrounds---

- Shimmer/glow animations (premium & fire)

- Consistent "HUMBUG!" watermarks## ✨ Key Features

- Matching pack selector styling

### 🎪 Hero Section

### 👑 Admin Panel

- Dramatic entrance with smooth fade-in animations and custom easing curves

Comprehensive dashboard for content management:- "Who Wants to be a Millionaire" inspired golden gradient theme

- Background image positioned at 40% from top for optimal visual impact

- **User Management** - Role assignment, user profiles, activity tracking- Interactive CTA button with hover effects (scales, border highlight)

- **Question Pack CRUD** - Create, edit, publish, and organize packs- Language switcher in top-right corner (Hungarian 🇭🇺 / English 🇬🇧)

- **Question Management** - Add/edit questions with multiple answers

- **Analytics Dashboard** - Stats, charts, and activity logs### 📋 Interactive Game Rules

- **Activity Logging** - Full audit trail of admin actions

- **Skin Editor** - Assign skins to packs via dropdown- **6 comprehensive rule sections**:

  1. **Preparation** - No equipment needed

--- 2. **Starting the Game** - Game master role and question format

3. **Players' Answers** - Mandatory answers and bluffing mechanics

## 🛠️ Technology Stack 4. **The "Humbug!"** - Challenge mechanics

5. **Victory and Defeat** - Lives, passes, and winning conditions

### Frontend 6. **Alternative Game Mode** - Multi-challenge variant for larger groups

- **Audio narration** available in both Hungarian and English

- **React 18.3** - UI framework with hooks- **Custom audio player** with:

- **TypeScript 5.5** - Type-safe development - Play/pause controls

- **Vite** - Fast build tool and dev server - Seekable progress bar

- **Tailwind CSS 4.1** - Utility-first styling - Volume control with mute button

- **Framer Motion** - Smooth animations - Time display (current/total)

- **shadcn/ui** - Accessible component library - Accessible keyboard controls

- **i18next** - Internationalization

### 🎵 Background Music Player

### Backend

- Looping HUMBUG! main theme for ambiance

- **Vercel Serverless Functions** - API endpoints- Smart controls that appear on hover or when playing

- **PostgreSQL (Neon)** - Serverless database- Default 30% volume for non-intrusive background atmosphere

- **JWT** - Authentication tokens- Volume slider with percentage display

- **Google OAuth 2.0** - User authentication- Animated music note icon when playing

- Status messages: "Now Playing..." / "Click to set the mood"

### DevOps

### 🃏 Question Card Gallery

- **Vercel** - Hosting and deployment

- **Git** - Version control (main → production, master → live)- **22+ complete questions** across 15 categories:

- **pnpm** - Package management - Tourism, Technology, Culture & History, Entertainment

  - Gastronomy, Sports, Travel, and more

---- **Interactive flip cards** with smooth 3D rotation animation

- **Answer management system**:

## 📁 Project Structure - Click answers to mark them as "used" (green highlighting)

- Visual counter showing selected/total format (e.g., "3/15")

````- Persistent state via localStorage

humbug-quiz/- **Smart layout system**: Automatically adjusts columns (1-4) based on answer count

├── api/                      # Vercel serverless functions- **Source attribution**: Clickable links to Wikipedia, IMDb, and other authoritative sources

│   ├── admin.ts             # Unified admin API endpoint- **Diagonal watermark**: "HUMBUG!" text on card backs for brand recognition

│   ├── question-sets.ts     # Question packs CRUD- **Game master helper text**: "Game master? Click for answers!"

│   ├── auth/                # OAuth authentication

│   │   ├── google.ts        # OAuth initiation### 🎨 Design Features

│   │   ├── callback.ts      # OAuth callback handler

│   │   ├── session.ts       # Session validation- **Typography**: Space Grotesk font family (self-hosted for network compatibility)

│   │   └── logout.ts        # Logout handler  - 5 weights available: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)

│   └── ...- **Color Scheme**: Deep navy background with golden yellow accents

├── src/                     # React application source  - Primary: Deep Navy `oklch(0.15 0.1 240)` - Authority and intelligence

│   ├── components/          # React components  - Accent: Rich Gold `oklch(0.75 0.15 85)` - Highlights and success states

│   │   ├── admin/          # Admin panel components  - Bright Gold: `oklch(0.85 0.18 90)` - High-energy CTAs

│   │   │   ├── AdminDashboard.tsx- **Animations**:

│   │   │   ├── PackEditDialog.tsx  - Studio lighting effects with animated radial gradients

│   │   │   └── UserManagementPanel.tsx  - Scroll-triggered entrance animations

│   │   ├── ui/             # shadcn/ui components  - Smooth card flips and hover states

│   │   ├── QuestionCard.tsx  - Floating decorative elements

│   │   ├── QuestionPackSelector.tsx- **Responsive Design**:

│   │   ├── AudioPlayer.tsx  - Mobile: Single column, touch-friendly controls (44px minimum)

│   │   └── ...  - Tablet: 2-column grid, optimized spacing

│   ├── context/            # React context providers  - Desktop: Multi-column layouts, enhanced animations

│   │   └── AuthContext.tsx # Authentication state

│   ├── hooks/              # Custom React hooks### 🌐 Internationalization

│   │   ├── useAuth.ts      # Auth hook

│   │   └── use-mobile.ts   # Mobile detection- **Full bilingual support** (Hungarian 🇭🇺 / English 🇬🇧)

│   ├── lib/                # Utility functions- **Language switcher** in hero section header

│   │   └── utils.ts        # Helper functions- **Persistent language preference** stored in localStorage

│   ├── locales/            # i18n translations- **Complete translations**

│   │   ├── en.json         # English translations- **Localized formatting**: Number formats, dates, etc.

│   │   └── hu.json         # Hungarian translations- **Automatic language detection** based on browser preferences

│   ├── App.tsx             # Main app component

│   └── main.tsx            # App entry point### 📱 Progressive Web App (PWA)

├── database/               # Database migration scripts

│   └── migrations/         # SQL migration files- **Offline Support**: App works without internet after first visit

├── public/                 # Static assets- **Installable**: Add to home screen on mobile/desktop

│   ├── fonts/              # Self-hosted fonts- **Automatic Updates**: Hourly checks for new versions

│   ├── manifest.json       # PWA manifest- **Smart Caching**: Cache-first strategy with network fallback

│   └── sw.js               # Service worker- **Service Worker**: Version-controlled asset caching

├── scripts/                # Database & maintenance scripts- **Update Notifications**: User-friendly prompts for new versions

│   ├── add-horror-*.cjs    # Horror pack scripts- **Manifest**: Full PWA configuration with icons and theme colors

│   ├── run-*.js            # Migration runners

│   ├── check-*.js          # Validation scripts---

│   └── test-*.js           # Test utilities

├── legacy/                 # Archived files## 🛠️ Technology Stack

│   ├── docs/               # Old documentation

│   │   ├── GOOGLE_OAUTH_SETUP.md### Core Technologies

│   │   ├── MULTIPLAYER_*.md

│   │   └── ...| Technology        | Version | Purpose                 |

│   ├── database-migrations/| ----------------- | ------- | ----------------------- |

│   ├── fix-docs/| **React**         | 18.3.1  | UI Component Framework  |

│   └── ...| **TypeScript**    | 5.5.3   | Static Type Safety      |

├── test/                   # Test files & utilities| **Vite**          | 6.3.6   | Build Tool & Dev Server |

├── docs/                   # Current documentation| **Tailwind CSS**  | 4.1.11  | Utility-First Styling   |

├── .github/                # GitHub configuration| **Framer Motion** | 12.0.0  | Animation Library       |

│   └── instructions/       # AI agent instructions

│       └── agents.md.instructions.md### UI Components & Libraries

├── vite.config.ts          # Vite configuration

├── vercel.json             # Vercel deployment config- **Radix UI**: Accessible, unstyled component primitives

├── tailwind.config.js      # Tailwind configuration  - `@radix-ui/react-dropdown-menu` - Dropdown menus

├── tsconfig.json           # TypeScript configuration  - `@radix-ui/react-dialog` - Modal dialogs

├── package.json            # Dependencies  - `@radix-ui/react-tabs` - Tab navigation

└── README.md               # This file  - `@radix-ui/react-separator` - Visual dividers

```- **Phosphor Icons**: Modern, clean icon library (Play, Pause, MusicNotes, etc.)

- **Class Variance Authority (CVA)**: Type-safe component variant management

---- **Tailwind Merge**: Intelligent class merging to prevent conflicts

- **clsx**: Conditional className utility

## 🚀 Installation

### Internationalization

### Prerequisites

- **i18next** (24.2.1): Core internationalization framework

- **Node.js** 18+ (LTS recommended)- **react-i18next** (15.2.3): React-specific i18n bindings

- **pnpm** 8+ (or npm/yarn)- **i18next-browser-languagedetector** (8.0.2): Automatic language detection

- **PostgreSQL database** (Neon recommended)

- **Google OAuth credentials** (for authentication)### Development Tools



### Setup- **ESLint**: Code quality and consistency enforcement

- **TypeScript Compiler**: Static type checking

1. **Clone the repository**- **Vite Plugin React**: Fast refresh and React optimizations

- **PostCSS**: CSS processing and optimization

   ```bash

   git clone https://github.com/szolzol/humbug-quiz.git### Fonts

   cd humbug-quiz

   ```- **Space Grotesk**: Self-hosted game show typography

  - Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

2. **Install dependencies**  - Format: TTF (TrueType Font)

  - Location: `public/fonts/`

   ```bash  - Purpose: Network compatibility (works on restricted networks without external CDN)

   pnpm install

   ```### Backend & Database



3. **Configure environment variables**- **Neon PostgreSQL**: Serverless PostgreSQL database

  - `@neondatabase/serverless` (0.10.6): Serverless-optimized database client

   Create `.env` file in the root:  - Stores users, questions, question sets, admin activity logs, and **multiplayer game state**

  - Connection pooling for optimal performance

   ```env  - **Multiplayer tables**: game_rooms, room_players, game_sessions, player_answers, humbug_events

   # Database- **Vercel Serverless Functions**: Unified API architecture (7/12 functions used)

   POSTGRES_POSTGRES_URL=postgresql://user:pass@host/db  - `/api/rooms.ts`: **Unified multiplayer endpoint** (create, join, leave, start, state, answer, next, humbug, available-sets)

  - `/api/admin.ts`: Unified admin endpoint (dashboard, users, questions, packs, activity logs)

   # Google OAuth  - `/api/auth/*`: OAuth authentication flow (4 endpoints: google, callback, session, logout)

   GOOGLE_CLIENT_ID=your_client_id  - `/api/questions/[slug].ts`: Question pack data

   GOOGLE_CLIENT_SECRET=your_client_secret  - `/api/question-sets.ts`: Pack listing

- **JWT Authentication**: Secure token-based authentication

   # JWT Secret  - `jsonwebtoken` (9.0.2): JWT token creation and validation

   JWT_SECRET=your_random_secret_key_here  - `cookie` (1.0.2): HTTP-only cookie management

   ```  - 7-day session expiration

  - Role-based access control (free, premium, admin, creator)

4. **Run database migrations**  - **Profile integration**: Auto-populate nickname from JWT token in multiplayer

- **Session Management**: Stateless HTTP sessions for multiplayer

   ```bash  - 64-character hex session IDs (256-bit entropy)

   node database/migrations/001_initial_schema.js  - HTTP-only cookies with SameSite protection

   node database/migrations/002_add_roles.js  - No authentication required for guest play

   node database/migrations/003_add_multiplayer.js

   node database/migrations/004_add_admin_activity_log.js---

   node database/migrations/005_add_skin_column.js

   ```## 🎮 Multiplayer Architecture



5. **Start development server**### Overview



   ```bashThe HUMBUG! multiplayer system enables **real-time online quiz games** with 2-10 players. Built with a **polling-based architecture** optimized for Vercel's serverless platform, it supports the full HUMBUG game mechanics including turn-based answering, HUMBUG challenges, lives, and winner determination.

   pnpm dev

   ```### Key Features



   Visit `http://localhost:5173`- ✅ **Real-time Gameplay** - 120 requests/minute/IP polling rate for smooth updates

- ✅ **Session-based Authentication** - No account required (guest play supported)

---- ✅ **JWT Profile Integration** - Auto-populate nickname from user profiles

- ✅ **Role-based Question Packs** - Free/Premium/Admin access levels

## 🔧 Development- ✅ **Fuzzy Answer Matching** - Tolerance for typos and formatting variations

- ✅ **HUMBUG Challenge Mechanic** - Challenge wrong answers, earn passes

### Available Scripts- ✅ **Lives System** - 3 lives per player, last survivor wins

- ✅ **State Synchronization** - ETag-based 304 responses for bandwidth efficiency

```bash- ✅ **Room Management** - 6-character room codes, auto-expiry after 24h

pnpm dev          # Start dev server (with API proxying)- ✅ **Comprehensive Event Log** - All game actions tracked with timestamps

pnpm build        # Build for production

pnpm preview      # Preview production build### Architecture Design

pnpm lint         # Run ESLint

```#### Polling-Based Real-time Updates



### Development WorkflowUnlike WebSocket-based architectures, the multiplayer system uses **HTTP polling** optimized for serverless environments:



1. **Main Branch** - Pre-production testing```typescript

2. **Master Branch** - Production live site// Client polling interval: 3 seconds

3. Always test on dev server before building// Rate limit: 120 requests/minute/IP

4. Update translations in both `en.json` and `hu.json`// ETag optimization: 304 Not Modified for unchanged state

5. Check `.github/instructions/agents.md.instructions.md` for guidelines

// Polling flow:

### Testing1. Client: GET /api/rooms?action=state&roomId={uuid}

2. Server: Check state_version against If-None-Match header

- Test mobile on actual devices (not just emulators)3. If unchanged: Return 304 Not Modified (no body)

- Check PWA features on local network: `pnpm dev --host`4. If changed: Return full game state with new ETag

- Validate accessibility with screen readers```

- Test OAuth flow in incognito mode

**Benefits:**

---

- ✅ Serverless-friendly (no persistent connections)

## 🏗️ Architecture- ✅ Automatic reconnection (stateless HTTP)

- ✅ Bandwidth efficient (ETag 304 responses)

### Authentication Flow- ✅ Simple debugging (standard HTTP requests)

- ✅ Works through firewalls/proxies

````

1. User clicks "Sign in with Google"#### Unified API Endpoint

2. Redirect to /api/auth/google

3. Google OAuth consent (prompt: 'select_account')To stay within Vercel's **12 serverless functions limit** (Hobby tier), all multiplayer operations use a **single endpoint** with action-based routing:

4. Callback to /api/auth/callback

5. Exchange code for user info```typescript

6. Save/update user in database, fetch role// Single endpoint: /api/rooms

7. Create JWT token (userId, email, name, nickname, picture, role)// Actions: create, join, leave, start, state, answer, next, humbug, available-sets

8. Set httpOnly cookie (7-day expiry)

9. Redirect to app with ?auth=success// Example requests:

````POST /api/rooms?action=create          // Create new room

POST /api/rooms?action=join            // Join existing room

### Database SchemaGET  /api/rooms?action=state           // Get current game state

POST /api/rooms?action=answer          // Submit answer

**Key Tables:**POST /api/rooms?action=humbug          // Challenge answer

POST /api/rooms?action=next            // Next question

- `users` - User profiles with rolesGET  /api/rooms?action=available-sets  // Get accessible question packs

- `question_sets` - Question packs with access levels and skins```

- `questions` - Individual questions (bilingual)

- `answers` - Multiple correct answers per question**Function Count:**

- `admin_activity_log` - Audit trail for admin actions

- `game_sessions` - Multiplayer game state- `/api/rooms.ts` - 1 function (all multiplayer operations)

- `/api/admin.ts` - 1 function (all admin operations)

### Role-Based Access Control- `/api/auth/*` - 4 functions (OAuth flow)

- `/api/questions/[slug].ts` - Dynamic route

| Role      | Access                                      |- **Total: ~7 functions** (well under 12 limit)

| --------- | ------------------------------------------- |

| `free`    | Free packs only                             |### Database Schema

| `premium` | Free + Premium packs                        |

| `admin`   | All packs including admin_only + dashboard  |#### Core Tables

| `creator` | All packs including admin_only + dashboard  |

```sql

### Skinning System-- Rooms: Game lobby and settings

CREATE TABLE game_rooms (

Centralized configuration in `src/components/QuestionCard.tsx`:  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code CHAR(6) UNIQUE NOT NULL,         -- Join code (e.g., "INFOLE")

```typescript  host_player_id UUID NOT NULL,         -- First player becomes host

const SKIN_STYLES = {  max_players INT DEFAULT 10,

  standard: { front: {...}, back: {...}, shimmer: false },  state VARCHAR(20) DEFAULT 'waiting',  -- waiting | in_progress | finished

  premium: { front: {...}, back: {...}, shimmer: true, shimmerColor: "via-purple-400/10" },  state_version INT DEFAULT 0,          -- Incremented on every state change

  fire: { front: {...}, back: {...}, shimmer: true, shimmerColor: "via-red-400/10" }  question_set_id INT,                  -- Which pack is being played

};  current_question_index INT DEFAULT 0,

```  created_at TIMESTAMPTZ DEFAULT NOW(),

  updated_at TIMESTAMPTZ DEFAULT NOW(),

Admins assign skins via dropdown in `PackEditDialog`, stored in database.  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'

);

---

-- Players: Participants in a room

## 🚀 DeploymentCREATE TABLE room_players (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

### Vercel Deployment  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,

  session_id VARCHAR(255) NOT NULL,     -- Browser session cookie

1. **Connect Repository**  nickname VARCHAR(50) NOT NULL,

  lives INT DEFAULT 3,

   - Link GitHub repo to Vercel  passes INT DEFAULT 0,                 -- Earned by successful HUMBUG challenges

   - Configure project settings  is_eliminated BOOLEAN DEFAULT FALSE,

  join_order INT NOT NULL,              -- Determines turn order

2. **Environment Variables**  joined_at TIMESTAMPTZ DEFAULT NOW()

);

   Add in Vercel dashboard:

-- Active Sessions: Current game state

   - `POSTGRES_POSTGRES_URL`CREATE TABLE game_sessions (

   - `GOOGLE_CLIENT_ID`  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

   - `GOOGLE_CLIENT_SECRET`  room_id UUID UNIQUE REFERENCES game_rooms(id) ON DELETE CASCADE,

   - `JWT_SECRET`  question_set_id INT NOT NULL,

  questions_ids INT[] NOT NULL,         -- Array of question IDs for this game

3. **Deploy**  current_question_index INT DEFAULT 0,

  current_turn_player_id UUID,          -- Whose turn to answer

   ```bash  pending_answer_id UUID,               -- Answer awaiting HUMBUG challenge

   git push origin main      # Deploy to staging  started_at TIMESTAMPTZ DEFAULT NOW()

   git push origin master    # Deploy to production);

````

-- Player Answers: Submitted answers and challenges

4. **Google OAuth Configuration**CREATE TABLE player_answers (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

Add authorized URIs in Google Cloud Console: session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,

- `https://humbug.hu` player_id UUID REFERENCES room_players(id) ON DELETE CASCADE,

- `https://www.humbug.hu` question_id INT NOT NULL,

- Redirect URIs: `https://humbug.hu/api/auth/callback`, etc. answer_text TEXT NOT NULL,

is_correct BOOLEAN, -- Null until checked/challenged

### Production Checklist was_challenged BOOLEAN DEFAULT FALSE,

challenger_id UUID, -- Who called HUMBUG

- [ ] All environment variables configured challenge_successful BOOLEAN, -- Did challenger guess correctly?

- [ ] Database migrations applied submitted_at TIMESTAMPTZ DEFAULT NOW()

- [ ] Google OAuth URIs updated);

- [ ] Admin user created in database

- [ ] PWA manifest and service worker tested-- Event Log: Complete game history

- [ ] Translations complete in both languagesCREATE TABLE humbug_events (

- [ ] All console.log statements removed id SERIAL PRIMARY KEY,

- [ ] Error tracking configured (optional) room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,

  event_type VARCHAR(50) NOT NULL, -- join, leave, answer, humbug, etc.

--- player_id UUID,

data JSONB, -- Event-specific payload

## 🤝 Contributing created_at TIMESTAMPTZ DEFAULT NOW()

);

### Development Guidelines```

1. Read `.github/instructions/agents.md.instructions.md` for project conventions#### State Transitions

2. Follow existing code patterns and component structure

3. Test on mobile devices before submitting PRs```

4. Update translations in both `en.json` and `hu.json`ROOM LIFECYCLE:

5. Document new features in agents guide1. waiting → in_progress (handleStart)

6. Clean up console.log statements2. in_progress → finished (last player standing)

7. Use parameterized queries for database operations3. finished → [auto-delete after 24h]

### Submitting ChangesTURN FLOW:

1. Player submits answer → pending_answer_id set

1. Create feature branch: `git checkout -b feature/your-feature`2. Other players can call HUMBUG → challenge resolved

1. Make changes and test thoroughly3. Next turn → current_turn_player_id updates

1. Commit with descriptive message: `git commit -m "feat: add new skin system"`4. All answered → handleNext advances question

1. Push to branch: `git push origin feature/your-feature````

1. Create Pull Request to `main` branch

### API Actions

---

#### 1. Create Room (`POST /api/rooms?action=create`)

## 📄 License

**Request:**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

````json

---{

  "maxPlayers": 10,

## 🙏 Credits  "questionSetId": 1 // Optional: defaults to first available

}

### Development```



- **Zoltan Szolnoki** - Lead Developer & Game Designer**Response:**



### Technologies```json

{

- [React](https://reactjs.org/) - UI framework  "success": true,

- [TypeScript](https://www.typescriptlang.org/) - Type safety  "data": {

- [Tailwind CSS](https://tailwindcss.com/) - Styling    "roomId": "uuid-here",

- [shadcn/ui](https://ui.shadcn.com/) - Component library    "code": "INFOLE",

- [Framer Motion](https://www.framer.com/motion/) - Animations    "playerId": "uuid-here",

- [Neon](https://neon.tech/) - Serverless PostgreSQL    "isHost": true

- [Vercel](https://vercel.com/) - Hosting platform  }

}

### Assets```



- **Space Grotesk Font** - Self-hosted for reliability**Backend Logic:**

- **Phosphor Icons** - Icon library

- Background images and audio files - Custom created1. Generate unique 6-character room code (A-Z0-9)

2. Create session cookie if not exists

---3. Insert game_rooms row

4. Add host as first room_player

## 📞 Contact5. Log "room_created" event



- **Website**: [humbug.hu](https://humbug.hu)#### 2. Join Room (`POST /api/rooms?action=join`)

- **GitHub**: [@szolzol](https://github.com/szolzol)

**Request:**

---

```json

<div align="center">{

  "code": "INFOLE",

**Made with ❤️ by Zoltan Szolnoki**  "nickname": "Player2" // Optional if authenticated

}

_If you enjoy HUMBUG!, please consider starring the repository!_```



⭐ [Star on GitHub](https://github.com/szolzol/humbug-quiz)**Response:**



</div>```json

{
  "success": true,
  "data": {
    "roomId": "uuid-here",
    "playerId": "uuid-here",
    "isHost": false,
    "nickname": "Player2", // From profile if authenticated
    "authenticated": true,
    "userRole": "premium"
  }
}
````

**Backend Logic:**

1. Check if authenticated → use profile nickname
2. Validate room code exists and is joinable
3. Check max_players limit
4. Create session cookie if guest
5. Insert room_players row with join_order
6. Increment state_version
7. Log "player_joined" event

**Profile Integration:**

```typescript
// JWT auth_token cookie contains:
{
  userId: "uuid",
  email: "user@example.com",
  name: "Full Name",
  nickname: "DisplayName",  // Auto-populated!
  role: "premium"           // free | premium | admin | creator
}

// Priority: profile nickname > provided nickname
const nickname = authUser?.nickname || body.nickname;
```

#### 3. Available Sets (`GET /api/rooms?action=available-sets`)

**Response:**

```json
{
  "success": true,
  "data": {
    "userRole": "premium",
    "authenticated": true,
    "sets": [
      {
        "id": 1,
        "slug": "free-pack",
        "name_en": "Free Pack",
        "name_hu": "Ingyenes csomag",
        "question_count": 4,
        "access_level": "free"
      },
      {
        "id": 2,
        "slug": "international-pack",
        "name_en": "International Pack",
        "name_hu": "Nemzetközi csomag",
        "question_count": 18,
        "access_level": "premium"
      }
    ]
  }
}
```

**Backend Logic:**

```typescript
// Role-based filtering:
- Admin/Creator: All question sets
- Premium: free + premium sets
- Free: free sets only

// Database query:
SELECT id, slug, name_en, name_hu, question_count, access_level
FROM question_sets
WHERE is_active = true
  AND access_level IN (allowed_levels)
ORDER BY display_order
```

#### 4. Start Game (`POST /api/rooms?action=start`)

**Request:**

```json
{
  "roomId": "uuid-here",
  "questionSetId": 2 // Optional: defaults to first available
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-here",
    "questionCount": 10,
    "firstPlayer": "uuid-here"
  }
}
```

**Backend Logic:**

1. Verify caller is host
2. Get user role from JWT or default to "free"
3. Get available question sets for role
4. Verify access to requested question set
5. Random sample of min(10, total_questions)
6. Create game_sessions row with questions_ids array
7. Set current_turn_player_id to first join_order
8. Update room state to "in_progress"
9. Increment state_version
10. Log "game_started" event

**Access Control:**

```typescript
// Verify host has access to selected pack
const userRole = authUser?.role || "free";
const availableSets = await getAvailableQuestionSets(userRole);

if (!availableSets.includes(questionSetId)) {
  return respond(res, false, undefined, "No access to set", 403);
}
```

#### 5. Get State (`GET /api/rooms?action=state`)

**Request:**

```
GET /api/rooms?action=state&roomId=uuid-here
Headers: If-None-Match: "version-123"
```

**Response (Changed):**

```json
{
  "success": true,
  "stateVersion": 124,
  "data": {
    "room": {
      "id": "uuid",
      "code": "INFOLE",
      "state": "in_progress",
      "maxPlayers": 10,
      "currentQuestionIndex": 2
    },
    "players": [
      {
        "id": "uuid",
        "nickname": "Host",
        "lives": 3,
        "passes": 1,
        "isEliminated": false,
        "isCurrentTurn": true
      }
    ],
    "session": {
      "questionCount": 10,
      "currentQuestion": {
        "id": 42,
        "question_text_en": "Name a football club...",
        "category": "Sports"
      },
      "pendingAnswer": {
        "answerId": "uuid",
        "playerNickname": "Host",
        "answerText": "Real Madrid",
        "submittedAt": "2025-10-22T10:30:00Z"
      }
    },
    "events": [
      {
        "type": "answer_submitted",
        "playerNickname": "Host",
        "data": { "answer": "Real Madrid" },
        "timestamp": "2025-10-22T10:30:00Z"
      }
    ]
  }
}
```

**Response (Unchanged):**

```
HTTP 304 Not Modified
(No body - saves bandwidth)
```

**Backend Logic:**

1. Check If-None-Match header against state_version
2. If match → return 304 Not Modified
3. If different → fetch full state:
   - Room info
   - All players (lives, passes, eliminated status)
   - Current session + question
   - Pending answer awaiting HUMBUG
   - Recent events (last 20)
4. Set ETag header to current state_version

**Polling Optimization:**

- 3-second client interval
- 304 responses = ~10 bytes
- Full state = ~5KB
- Average bandwidth: ~200 bytes/sec

#### 6. Submit Answer (`POST /api/rooms?action=answer`)

**Request:**

```json
{
  "roomId": "uuid-here",
  "answer": "Real Madrid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "answerId": "uuid-here",
    "isCorrect": true,
    "canBeChallenged": false // true if bluffing allowed
  }
}
```

**Backend Logic:**

1. Verify player's turn
2. Fetch correct answers from database
3. **Apply fuzzy matching** (see below)
4. Insert player_answers row
5. If correct: Set pending_answer_id for HUMBUG window
6. If wrong (bluff attempt): Set is_correct=false, still challengeable
7. Increment state_version
8. Log "answer_submitted" event

**Fuzzy Answer Matching:**

```typescript
/**
 * Tolerant answer matching algorithm
 * Accepts answers with typos, missing articles, formatting differences
 */
function fuzzyMatchAnswer(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  // Step 1: Normalize both answers
  // - Lowercase
  // - Remove articles: "the", "a", "an", "le", "la", "les"
  // - Remove club suffixes: "FC", "United", "City", "CF"
  // - Remove special characters
  // - Normalize whitespace

  // Step 2: Extract key words (>2 characters)
  const userWords = extractKeyWords(normalizedUser);
  const correctWords = extractKeyWords(normalizedCorrect);

  // Step 3: Match words with typo tolerance
  const matchingWords = userWords.filter((word) =>
    correctWords.some((cWord) => {
      // Exact match
      if (word === cWord) return true;

      // Levenshtein distance ≤ 1 (1-character typo)
      if (word.length >= 3 && levenshteinDistance(word, cWord) <= 1) {
        return true;
      }

      return false;
    })
  );

  // Step 4: Calculate overlap ratio
  const overlapRatio = matchingWords.length / correctWords.length;

  // Accept if:
  // - 100% exact word match OR
  // - ≥75% match for multi-word answers
  return (
    overlapRatio === 1.0 || (correctWords.length >= 2 && overlapRatio >= 0.75)
  );
}
```

**Examples:**

```typescript
// ✅ Missing articles
"The Matrix" → "Matrix" = MATCH
"The Beatles" → "Beatles" = MATCH

// ✅ Missing suffixes
"Manchester United" → "Manchester" = MATCH
"Real Madrid CF" → "Real Madrid" = MATCH

// ✅ Typos (1-character tolerance)
"Barcelona" → "Barcelone" = MATCH
"Beethoven" → "Bethoveen" = MATCH

// ✅ Case insensitive
"REAL MADRID" → "Real Madrid" = MATCH

// ❌ Wrong answers
"Real Madrid" → "Liverpool" = NO MATCH

// ❌ Partial names (<75% word overlap)
"Cristiano Ronaldo" → "Cristiano" = NO MATCH (50%)
```

#### 7. HUMBUG Challenge (`POST /api/rooms?action=humbug`)

**Request:**

```json
{
  "roomId": "uuid-here",
  "answerId": "uuid-of-pending-answer"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "challengeSuccessful": true,
    "answerWasCorrect": false,
    "challengerEarnedPass": true,
    "answererLostLife": true,
    "answererEliminated": false
  }
}
```

**Backend Logic:**

1. Verify answerId matches pending_answer_id
2. Fetch correct answers from database
3. Check if answer was actually correct
4. **If answer was WRONG** (successful challenge):
   - Answerer loses 1 life
   - Challenger earns 1 pass
   - If answerer lives = 0 → set is_eliminated = true
5. **If answer was CORRECT** (failed challenge):
   - Challenger loses 1 life
   - If challenger lives = 0 → set is_eliminated = true
6. Update player_answers: was_challenged=true, challenger_id, challenge_successful
7. Clear pending_answer_id
8. Check win condition (only 1 player alive)
9. Increment state_version
10. Log "humbug_challenge" event

#### 8. Next Question (`POST /api/rooms?action=next`)

**Request:**

```json
{
  "roomId": "uuid-here"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "nextQuestionIndex": 3,
    "hasMoreQuestions": true,
    "nextPlayer": "uuid-here"
  }
}
```

**Backend Logic:**

1. Verify caller is host
2. Increment current_question_index
3. Find next non-eliminated player by join_order
4. Update current_turn_player_id
5. Clear pending_answer_id
6. Increment state_version
7. Log "next_question" event
8. If no more questions → end game

#### 9. Leave Room (`POST /api/rooms?action=leave`)

**Request:**

```json
{
  "roomId": "uuid-here"
}
```

**Response:**

```json
{
  "success": true
}
```

**Backend Logic:**

1. Delete player from room_players
2. If player was host → assign new host (lowest join_order)
3. If no players left → delete entire room
4. Increment state_version
5. Log "player_left" event

### Rate Limiting

```typescript
// In-memory rate limiting per IP address
const RATE_LIMIT_WINDOW = 60 * 1000;  // 1 minute
const RATE_LIMIT_MAX = 120;            // 120 requests/minute/IP

// Response headers:
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 95

// 429 Too Many Requests if exceeded
```

**Why 120/min?**

- 3-second polling interval = 20 req/min base
- Multiple tabs/devices = 3x = 60 req/min
- Additional actions (join, answer, humbug) = +60 req/min buffer
- **Total: 120 req/min per IP**

### Session Management

```typescript
// HTTP-only session cookie (no authentication required)
const SESSION_COOKIE_NAME = "humbug_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Cookie attributes:
{
  httpOnly: true,           // Prevents XSS
  secure: true,             // HTTPS only in production
  sameSite: "lax",          // CSRF protection
  maxAge: 604800,           // 7 days
  path: "/"
}

// Session ID: 64-character hex (256-bit entropy)
const sessionId = randomBytes(32).toString("hex");
```

### Event Logging

All game actions are logged for debugging, analytics, and replay:

```typescript
// Event types:
- room_created
- player_joined
- player_left
- game_started
- answer_submitted
- humbug_challenge
- next_question
- game_finished

// Example event:
{
  "id": 12345,
  "room_id": "uuid",
  "event_type": "humbug_challenge",
  "player_id": "uuid-challenger",
  "data": {
    "answerId": "uuid",
    "answerText": "Wrong Answer",
    "successful": true,
    "answererLives": 2,
    "challengerPasses": 1
  },
  "created_at": "2025-10-22T10:30:00Z"
}
```

### Error Handling

```typescript
// Standardized error responses:
{
  "success": false,
  "error": "Human-readable error message"
}

// Common errors:
- 400 Bad Request: Invalid input (Zod validation)
- 403 Forbidden: Not host, wrong turn, no access to pack
- 404 Not Found: Room/player doesn't exist
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Database error

// All errors logged to console for debugging
```

### Testing

**Backend Test Suite** (`test-multiplayer-backend.js`):

```bash
node test-multiplayer-backend.js

# Tests all 8 actions:
✅ Create room
✅ Join room
✅ Start game
✅ Get state
✅ Submit answer
✅ HUMBUG challenge
✅ Next question
✅ Leave room

# Output: "🎉 All tests passed!"
```

**Fuzzy Matching Test** (`test-fuzzy-matching.js`):

```bash
node test-fuzzy-matching.js

# 15 test cases:
✅ Missing articles
✅ Missing suffixes
✅ Typos (1-char)
✅ Case sensitivity
✅ Multi-word matching
✅ Wrong answers rejected
✅ Numbers/special chars
✅ Partial names rejected
```

### Performance Considerations

**Bandwidth:**

- ETag 304 responses: ~10 bytes
- Full state response: ~5KB
- Average per client: ~200 bytes/sec

**Database Queries:**

- Room state: Single JOIN query (~5ms)
- Answer validation: Indexed lookup (~2ms)
- State updates: Single UPDATE + increment (~3ms)

**Serverless Optimization:**

- Connection pooling (Neon serverless)
- No cold start issues (stateless HTTP)
- Automatic scaling (Vercel handles concurrency)

### Security

**Session Security:**

- HTTP-only cookies (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite=lax (CSRF protection)
- 7-day expiration

**Input Validation:**

- Zod schemas for all actions
- SQL injection protection (parameterized queries)
- Rate limiting per IP
- Host-only actions verified

**Access Control:**

- JWT-based role checking
- Question pack access by subscription tier
- Host-only actions (start, next)
- Turn-based action verification

---

## 👑 Admin Panel

### Overview

The HUMBUG! admin panel is a comprehensive content management system built with a serverless-first architecture. It provides complete control over users, questions, question packs, and system monitoring.

### Key Features

#### 📊 Dashboard

- **Real-time Statistics**:
  - Total users with weekly growth
  - Total questions with weekly additions
  - Total plays with weekly trends
  - Total solved questions
  - Recent activity count (24h)
- **Growth Analytics**:
  - 30-day line chart showing user growth (yellow line)
  - 30-day play count trends (green line)
  - Interactive tooltips with formatted dates
  - Responsive chart design

#### 👥 User Management

- **User List**: Paginated table with search and role filtering
- **User Editing**: Update name, email, role (user/admin), active status
- **User Deletion**: Soft delete with confirmation dialog
- **Activity Tracking**: All user management actions logged

#### 🃏 Question Management

- **Question CRUD**: Create, read, update, delete questions
- **Answer Management**: Multiple answers per question with correct/alternative flags
- **Category System**: Organize questions by category
- **Pack Assignment**: Link questions to specific question sets
- **Difficulty Levels**: Easy, Medium, Hard classification
- **Search & Filter**: Find questions by text, category, pack, status
- **Bulk Operations**: Multi-select for batch actions

#### 📦 Pack Management

- **Pack CRUD**: Full question pack lifecycle management
- **Pack Types**: FREE, PREMIUM, EXCLUSIVE
- **Access Levels**: PUBLIC, REGISTERED, ADMIN
- **Metadata**: Name, description, slug, icon
- **Question Assignment**: Link/unlink questions to packs
- **Pack Analytics**: Question count, play statistics

#### 📜 Activity Log

- **Comprehensive Logging**: All admin actions tracked
- **Action Types**: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- **Entity Types**: user, question, pack, auth
- **Filter System**: By action type, entity type, admin, date range
- **Pagination**: Efficient browsing of activity history
- **User Attribution**: Admin name, email, profile picture
- **Timestamp Display**: Relative time (e.g., "2 hours ago")
- **Details View**: JSON data for each action

### Architecture

#### Unified Admin API (`/api/admin.ts`)

The admin panel uses a **single serverless function** to handle all operations, avoiding Vercel's 12-function limit:

```typescript
// Endpoint structure: /api/admin?resource={resource}&action={action}

Resources:
- users: User management (list, create, update, delete)
- questions: Question management (list, create, update, delete)
- answers: Answer management (list by question)
- packs: Question pack management (list, create, update, delete)
- activity: Activity log (list, filter, search)
- dashboard-stats: Dashboard statistics and analytics

Actions (REST-style):
- GET: List/retrieve resources
- POST: Create new resources
- PUT: Update existing resources
- DELETE: Remove resources
```

**Benefits:**

- ✅ Only 1 of 12 Vercel function slots used for admin
- ✅ Consistent error handling and logging
- ✅ Shared authentication middleware
- ✅ Unified activity logging system
- ✅ Easy to maintain and extend

#### Activity Logging System

All admin actions are automatically logged to `admin_activity_log` table:

```typescript
// Automatic logging on every admin action
await logActivity(
  admin.id,           // Who performed the action
  "UPDATE",           // What type of action (CREATE/UPDATE/DELETE)
  "question",         // What entity was affected
  questionId,         // Which specific entity
  {
    changes: {...},   // What changed
    previous: {...}   // What it was before
  },
  req                 // Request context (IP, user agent)
);
```

**Logged data:**

- Admin user ID, name, email, picture
- Action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- Entity type (user, question, pack, auth)
- Entity ID (specific record affected)
- Detailed changes (JSON)
- IP address and user agent
- Timestamp (automatic)

#### Database Schema

**Core Tables:**

- `users`: User accounts (id, name, email, picture, role, is_active)
- `questions`: Question bank (id, question_en, question_hu, category, difficulty)
- `answers`: Question answers (id, question_id, answer_en, answer_hu, is_correct)
- `question_sets`: Question packs (id, name, slug, type, access_level)
- `admin_activity_log`: Activity tracking (id, user_id, action_type, entity_type, details)

**Relationships:**

- Questions → Question Sets (many-to-one via set_id)
- Questions → Answers (one-to-many)
- Admin Activity → Users (many-to-one via user_id)

### UI/UX Design

#### Layout

- **Horizontal Navigation Bar** (desktop):
  - Dashboard, Users, Questions, Packs, Activity tabs
  - Slim user profile section (avatar, name, logout)
  - Responsive hover states and active indicators
- **Collapsible Sidebar** (mobile/tablet):
  - Toggle button for space efficiency
  - Full-width navigation items
  - User profile at bottom

#### Components

- **Stat Cards**: TrendingUp indicators for weekly changes
- **Data Tables**: Sortable, paginated, searchable
- **Edit Dialogs**: Modal forms with validation
- **Confirmation Dialogs**: Destructive action protection
- **Toast Notifications**: Success/error feedback
- **Loading States**: Skeleton loaders and spinners

#### Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus management in dialogs
- Screen reader friendly

### Security

- **Role-Based Access Control**: Only users with `role='admin'` can access
- **Session Validation**: JWT token verified on every request
- **CSRF Protection**: SameSite cookies
- **XSS Prevention**: Input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **Audit Trail**: All actions logged with attribution

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

---

## 📁 Project Structure

```
humbug-quiz/
├── api/                             # Vercel serverless functions
│   ├── admin.ts                     # Unified admin API (users, questions, packs, activity)
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
│   ├── migrations/                  # Migration scripts
│   │   ├── add-activity-logs.sql    # Add admin activity logging
│   │   ├── cleanup-activity-tables.sql # Remove old activity tables
│   │   └── consolidate-activity-logs.sql # Consolidate to admin_activity_log
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
│   ├── verify-activity-table.sql    # Activity table verification
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
│   │   ├── admin/                   # Admin panel components
│   │   │   ├── AdminLayout.tsx      # Admin panel layout wrapper
│   │   │   ├── PackEditDialog.tsx   # Pack create/edit modal
│   │   │   ├── QuestionEditDialog.tsx # Question create/edit modal
│   │   │   └── UserEditDialog.tsx   # User edit modal
│   │   └── ui/                      # Radix UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── separator.tsx
│   │       ├── table.tsx            # Data table component
│   │       ├── dialog.tsx           # Modal dialogs
│   │       ├── select.tsx           # Dropdown selects
│   │       ├── input.tsx            # Form inputs
│   │       ├── textarea.tsx         # Text areas
│   │       ├── badge.tsx            # Status badges
│   │       ├── alert-dialog.tsx     # Confirmation dialogs
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
│   ├── pages/                       # Admin panel pages
│   │   ├── AdminDashboard.tsx       # Dashboard with stats & charts
│   │   ├── UsersPage.tsx            # User management page
│   │   ├── QuestionsPage.tsx        # Question management page
│   │   ├── PacksPage.tsx            # Pack management page
│   │   └── ActivityPage.tsx         # Activity log page
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
├── .github/
│   └── instructions/
│       └── agents.md.instructions.md # AI agent development guidelines
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

| Command                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start Vite dev server (frontend only, no APIs) |
| `npm run dev:full`      | Start Vercel dev (frontend + API functions) ⭐ |
| `npm run dev -- --host` | Expose dev server on local network             |
| `npm run build`         | Build production bundle to `dist/`             |
| `npm run preview`       | Preview production build locally               |
| `npm run lint`          | Run ESLint for code quality checks             |
| `npm run type-check`    | Run TypeScript compiler checks                 |
| `npm run migrate`       | Run database migration scripts                 |

> ⚠️ **Important**: Use `npm run dev:full` when working with question packs, authentication, or any API features. The regular `npm run dev` only runs the Vite frontend server and will **not** load question packs.

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
