# 🎲 HUMBUG! - Quiz Party Game Landing Page

![HUMBUG! Banner](./src/assets/images/humbug-mood.png)

**FAKE IT TILL YOU WIN IT**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://humbug-quiz.vercel.app)
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
- [Deployment](#-deployment)
- [Credits](#-credits)
- [License](#-license)

---

## 🎯 Overview

**HUMBUG!** is an innovative quiz party game designed for 3-8 players (age 12+) that puts a unique twist on traditional trivia games. This web application provides:

- 🎵 **Background Music Player** - Looping theme music with smart controls
- 🎤 **Interactive Audio Rules** - Complete game explanations in Hungarian and English
- 🃏 **Complete Question Database** - 22+ quiz questions across 15 diverse categories
- 🎨 **Game Show Aesthetics** - "Who Wants to be a Millionaire" inspired design
- 🌐 **Bilingual Support** - Full Hungarian/English localization
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ♿ **Accessibility Features** - Keyboard navigation, ARIA labels, screen reader support

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

---

## 📁 Project Structure

```
humbug-quiz/
├── public/                          # Static assets
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
│   │   ├── LanguageSwitcher.tsx     # Language toggle
│   │   ├── QuestionCard.tsx         # Flip card component
│   │   └── ui/                      # Radix UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── separator.tsx
│   │       └── ... (30+ components)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── use-mobile.ts            # Mobile detection hook
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

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5000`
   - Or access from network: `http://[your-ip]:5000`

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

## 🚀 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment:

1. **Connect Repository**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

2. **Configure Build**

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables** (if needed)

   - None required for current setup

4. **Deploy**
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for all PRs

### Custom Headers (vercel.json)

The project includes a `vercel.json` with:

- CORS headers for fonts
- Cache control for static assets
- Security headers (CSP, X-Frame-Options)

### Manual Deployment

```bash
# Build production bundle
npm run build

# Test locally
npm run preview

# Deploy dist/ folder to your hosting provider
```

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

- **Live Demo**: [humbug-quiz.vercel.app](https://humbug-quiz.vercel.app)
- **Repository**: [github.com/szolzol/humbug-quiz](https://github.com/szolzol/humbug-quiz)
- **Issues**: [GitHub Issues](https://github.com/szolzol/humbug-quiz/issues)

---

<div align="center">

**Made with ❤️ for party game enthusiasts**

⭐ Star this repo if you find it useful!

</div>
