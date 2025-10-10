# 🎲 HUMBUG! Quiz Party Game - Official Landing Page# 🎲 HUMBUG! - Quiz Party Game Landing Page# ✨ Welcome to Your Spark Template!

![HUMBUG! Banner](./src/assets/images/humbug-mood.png)You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

**FAKE IT TILL YOU WIN IT**# 🎲 HUMBUG! - Quiz Party Game Landing Page

> A modern, interactive landing page for HUMBUG! - an experimental quiz party board game that combines trivia knowledge, strategic thinking, and psychological bluffing.**FAKE IT TILL YOU WIN IT**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://humbug-quiz.vercel.app)This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)A captivating landing page for an experimental offline quiz party game that combines strategy, bluffing, and trivia knowledge.

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)🚀 What's Inside?

---## 🚀 Quick Start- A clean, minimal Spark environment

## 📖 Table of Contents- Pre-configured for local development

- [Overview](#-overview)````bash- Ready to scale with your ideas

- [Game Concept](#-game-concept)

- [Features](#-features)# Install dependencies

- [Technology Stack](#-technology-stack)

- [Project Structure](#-project-structure)npm install🧠 What Can You Do?

- [Installation](#-installation)

- [Development](#-development)

- [Deployment](#-deployment)

- [Game Rules](#-game-rules)# Run development serverRight now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

- [Question Database](#-question-database)

- [Design Philosophy](#-design-philosophy)npm run dev

- [Performance](#-performance)

- [Credits](#-credits)🧹 Just Exploring?

- [License](#-license)

# Build for productionNo problem! If you were just checking things out and don’t need to keep this code:

---

npm run build

## 🎯 Overview

`````- Simply delete your Spark.

**HUMBUG!** is an innovative quiz party game designed for 3-8 players that puts a unique twist on traditional trivia games. Players must not only answer questions correctly but also detect when others are bluffing with incorrect answers. This landing page serves as the official digital showcase for the game, featuring:

- Everything will be cleaned up — no traces left behind.

- **Interactive game rule explanations** with audio narration

- **Complete question database** across 15 diverse categoriesThe site will be available at `http://localhost:5000`

- **Engaging UI/UX** with smooth animations and game show aesthetics

- **Fully responsive design** optimized for all devices📄 License For Spark Template Resources

- **Accessibility features** for inclusive gameplay

## 🎯 Project Overview

---

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🎮 Game Concept

HUMBUG is a quiz-based party game for 3-8 players where knowing the answers is only half the battle - you also need to spot when others are bluffing!

### Core Mechanics

### Key Features

HUMBUG! transforms traditional quiz games by introducing a **bluffing element**. Players take turns answering open-ended questions with multiple correct answers. The catch? You can bluff with a wrong answer, hoping others won't challenge you. If someone calls "HUMBUG!" on your answer:

- **🎪 Dramatic Hero Section** - Game-show inspired design with custom background imagery

- ✅ **You were right** → The challenger loses a life- **📋 Interactive Rules** - Audio player with complete game rules in Hungarian

- ❌ **You were wrong** → You lose a life- **🃏 15 Quiz Categories** - Complete question database with all answers

- 🎯 **Successful challenge** → The challenger earns a "pass" token- **✨ Smooth Animations** - Framer Motion powered transitions and interactions

- **📱 Fully Responsive** - Mobile-first design that works on all devices

The game continues until only one player remains "alive" - requiring both knowledge and psychological insight to win.

## 🛠️ Technology Stack

### Unique Features

- **React 18** + **TypeScript** - Modern component-based architecture

- **Knowledge + Psychology**: Success requires both trivia knowledge AND the ability to read opponents- **Vite** - Lightning-fast build tool and dev server

- **Strategic Depth**: Decide when to bluff, when to challenge, and when to pass- **Tailwind CSS** - Utility-first styling with custom theme

- **Social Dynamics**: Creates memorable moments of tension, laughter, and surprise- **Radix UI** - Accessible component primitives

- **Quick to Learn**: 5-minute rule explanation, yet endlessly replayable- **Framer Motion** - Smooth animations and transitions

- **Flexible Difficulty**: Questions span from pop culture to academic topics- **Phosphor Icons** - Beautiful icon library



---## 📁 Project Structure



## ✨ Features````



### 🎪 Landing Page Featureshumbug-quiz/

├── src/

#### **1. Hero Section**│ ├── assets/

- Dramatic entrance with smooth fade-in animations│ │ ├── audio/ # Game rules audio

- Custom easing curves for cinema-quality motion│ │ └── images/ # Background images

- Background imagery showcasing game atmosphere│ ├── components/

- Clear call-to-action for immediate engagement│ │ ├── AudioPlayer.tsx # Custom audio component

│ │ ├── QuestionCard.tsx # Flip card component

#### **2. Interactive Game Rules**│ │ └── ui/ # Radix UI components

- **Audio Narration**: Full Hungarian-language rule explanation (MP3)│ ├── App.tsx # Main application

- **Custom Audio Player**: Built with React, featuring play/pause and progress tracking│ └── main.tsx # Entry point

- **Visual Rule Breakdown**: 5-step illustrated guide├── source_media/ # Original source files

- **Accessibility**: Both audio and text formats for all learning styles└── index.html



#### **3. Question Card Gallery**````

- **15 Complete Categories**: Tourism, Social Media, Literature, Video Games, Cars, Airports, Movies, Football, Music, Names, Gastronomy, Technology, Marvel, Television, History

- **Interactive Flip Cards**: Click to reveal answers with 3D rotation animation## 🎨 Custom Fonts

- **Smart Layout System**:

  - 1-8 answers → Single columnThe project uses game-show inspired typography:

  - 9-15 answers → Two columns- **Bebas Neue** - Bold, dramatic title font

  - 16+ answers → Three columns- **Russo One** - Secondary display font

- **Clickable Answers**: Mark answers as "used" with green highlighting- **Inter** - Body text and UI elements

- **16:9 Aspect Ratio**: Optimized for modern displays

## 📝 Game Rules Summary

#### **4. Feature Highlights**

- Knowledge vs. Bluffing dynamics1. **The Question** - Game master asks a question with multiple correct answers

- Social experience (3-8 players)2. **Taking Turns** - Players give answers in sequence

- Strategic depth3. **The "Humbug!" Call** - Challenge a suspected wrong answer

- Simple rules, complex gameplay4. **Win/Lose** - Wrong caller loses a life; wrong answerer loses a life

5. **Victory** - Last player standing wins!

#### **5. Professional Footer**

- Creator credits: Szoleczki Zoltán & Beró Zsolt## 🎯 Question Categories (15 Total)

- Copyright information

- Game tagline1. Tourism - Popular Hungarian destinations

2. Social Media - Instagram celebrities

### 🎨 Design Features3. Literature - NAT curriculum authors

4. Video Games - 100M+ selling franchises

- **Typography**: Poppins font family (modern, clean, Hungarian character support)5. Car Brands - Most common in Hungary

- **Color Scheme**: Dark theme with gold/yellow accents (game show inspired)6. Airports - Europe's busiest

- **Animations**: Framer Motion powered smooth transitions7. Movies - Top IMDb rated films

- **Responsive**: Mobile-first design, tablet-optimized, desktop-enhanced8. Football - Champions League leaders

- **Accessibility**: Keyboard navigation, screen reader support, ARIA labels9. Music - 200M+ album sellers

10. Names - Most common Hungarian female names

### 🚀 Technical Features11. Gastronomy - Bocuse d'Or recipe ingredients

12. Technology - Most downloaded apps 2023

- **React 18**: Latest React features including concurrent rendering13. Marvel - MCU frequent characters

- **TypeScript**: Full type safety and IntelliSense support14. Television - Emmy award winners (20+)

- **Vite**: Lightning-fast HMR and optimized builds15. History - Hungarian PM first names

- **Tailwind CSS v4**: Utility-first styling with custom theme

- **Radix UI**: Accessible, unstyled component primitives## 📄 License

- **Framer Motion**: Professional animation library

- **Code Splitting**: Optimized bundle sizes for fast loadingThe Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

- **SEO Ready**: Meta tags, semantic HTML, Open Graph support

## 🎮 Game Components

---

- **Hero Section** - Eye-catching introduction with background image

## 🛠️ Technology Stack- **Features Grid** - 4 key game highlights

- **Rules Section** - Detailed gameplay explanation with audio

### Core Technologies- **Question Gallery** - Interactive flip cards for all 15 questions

- **Footer** - Branding and copyright

| Technology | Version | Purpose |

|------------|---------|---------|## 🔧 Development

| **React** | 18.3.1 | UI Framework |

| **TypeScript** | 5.5.3 | Type Safety |The project uses:

| **Vite** | 6.3.6 | Build Tool |- ESLint for code quality

| **Tailwind CSS** | 4.1.11 | Styling |- TypeScript for type safety

| **Framer Motion** | 12.0.0 | Animations |- Vite for fast HMR (Hot Module Replacement)

- Tailwind CSS for styling

### UI Components & Libraries

## 📦 Build & Deploy

- **Radix UI**: Dropdown, Dialog, Tabs, Tooltip, and more

- **Phosphor Icons**: Modern icon library (1500+ icons)```bash

- **Class Variance Authority**: Component variant management# Build for production

- **Tailwind Merge**: Intelligent class mergingnpm run build



### Development Tools# Preview production build

npm run preview

- **ESLint**: Code quality and consistency````

- **TypeScript Compiler**: Static type checking

- **Vite Plugin React**: Fast refresh and optimizationsBuilt files will be in the `dist/` directory, ready for deployment to any static hosting service.

- **PostCSS**: CSS processing

---

### Fonts

**Created with ❤️ for quiz lovers and bluffing masters!**

- **Poppins**: Primary typeface (400-900 weights)
- Loaded via Google Fonts API for optimal performance

---

## 📁 Project Structure

`````

humbug-quiz/
├── public/ # Static assets
├── src/
│ ├── assets/
│ │ ├── audio/ # Game audio files
│ │ │ └── humbug-rules.mp3
│ │ └── images/ # Images and graphics
│ │ └── humbug-mood.png
│ ├── components/
│ │ ├── ui/ # Radix UI components
│ │ │ ├── button.tsx
│ │ │ ├── card.tsx
│ │ │ ├── separator.tsx
│ │ │ └── ...
│ │ ├── AudioPlayer.tsx # Custom audio player
│ │ └── QuestionCard.tsx # Interactive flip card
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utility functions
│ ├── styles/
│ │ └── theme.css # Color scheme & variables
│ ├── App.tsx # Main application
│ ├── main.tsx # Entry point
│ ├── index.css # Base styles
│ └── main.css # Global styles
├── source_media/ # Original source files
│ ├── Humbug_rules.mp3
│ ├── Humbug_questions_answers.docx
│ └── Humburg_mood.png
├── .gitignore
├── components.json # Radix UI config
├── index.html
├── package.json
├── README.md # This file
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── vercel.json # Vercel deployment config

````

---

## 🚀 Installation

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Git**: For cloning the repository

### Quick Start

```bash
# Clone the repository
git clone https://github.com/szolzol/humbug-quiz.git

# Navigate to project directory
cd humbug-quiz

# Install dependencies
npm install

# Start development server
npm run dev
````

The application will be available at **http://localhost:5000**

---

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot module replacement
2. **Type Safety**: TypeScript ensures compile-time type checking
3. **Code Quality**: ESLint enforces consistent code style
4. **Component Development**: Radix UI provides accessible base components
5. **Styling**: Tailwind CSS for rapid UI development

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
# Example - no environment variables currently required
# VITE_API_URL=https://api.example.com
```

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

This project is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

**Automatic Deployment**: Connect your GitHub repository to Vercel for automatic deployments on every push.

### Other Platforms

#### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

#### GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

### Build Output

- **Output Directory**: `dist/`
- **Static Assets**: Optimized and fingerprinted
- **Code Splitting**: Automatic chunk optimization
- **Asset Optimization**: Images, fonts, and media compressed

---

## 📜 Game Rules

### Complete Rule Set

#### 1. **Question Phase**

The game master poses a question with multiple correct answers. Example: _"Name countries that have hosted the Olympic Games."_

#### 2. **Answer Giving**

Players take turns providing answers. The game master does **not** reveal if answers are correct or incorrect during this phase.

#### 3. **The "Humbug!" Challenge**

A round ends when any player calls "Humbug!" on the previous player's answer. The game master then checks the answer's validity.

#### 4. **Resolution**

- **Correct Answer Challenged**: Challenger loses a life
- **Incorrect Answer Challenged**: Answer-giver loses a life
- **Successful Challenge**: Challenger earns a "pass" token (can skip one future turn)

#### 5. **Victory Condition**

Players start with 1-3 lives (agreed upon before game). The last player remaining wins.

### Game Variants

- **Multi-Challenge Mode**: Multiple challenges can occur in one round
- **Speed Mode**: Faster answer timing for advanced players
- **Team Mode**: 2v2 or 3v3 team competitions

---

## 🗂️ Question Database

### 15 Categories with Complete Answer Sets

| Category         | Question Count | Example                                                  |
| ---------------- | -------------- | -------------------------------------------------------- |
| **Tourism**      | 15 answers     | "Most popular Hungarian destinations by overnight stays" |
| **Social Media** | 12 answers     | "Instagram accounts with 100M+ followers"                |
| **Literature**   | 31 answers     | "Authors in Hungarian NAT curriculum"                    |
| **Video Games**  | 20 answers     | "Gaming franchises with 100M+ sales"                     |
| **Car Brands**   | 15 answers     | "Most common car brands in Hungary"                      |
| **Airports**     | 13 answers     | "Cities with Europe's busiest airports"                  |
| **Movies**       | 20 answers     | "Films with 8.7+ IMDb rating"                            |
| **Football**     | 15 answers     | "Top Champions League point scorers since 1992"          |
| **Music**        | 18 answers     | "Artists with 200M+ album sales"                         |
| **Names**        | 15 answers     | "Most common female names in Hungary"                    |
| **Gastronomy**   | 25 answers     | "Ingredients in Bocuse d'Or winning recipe"              |
| **Technology**   | 10 answers     | "Most downloaded apps of 2023"                           |
| **Marvel**       | 14 answers     | "Characters in 7+ MCU films"                             |
| **Television**   | 22 answers     | "TV shows with 20+ Emmy awards"                          |
| **History**      | 24 answers     | "First names of Hungarian Prime Ministers"               |

**Total Questions**: 15 categories
**Total Unique Answers**: 250+ validated answers

---

## 🎨 Design Philosophy

### Visual Language

The design draws inspiration from classic quiz shows like "Who Wants to Be a Millionaire?" while incorporating modern web design principles:

- **Dark Theme**: Creates drama and focus
- **Gold Accents**: Evokes prestige and competition
- **Smooth Animations**: Cinema-quality easing curves (cubic-bezier)
- **Clear Hierarchy**: Content organized for optimal readability

### User Experience Principles

1. **Clarity First**: Rules and gameplay immediately understandable
2. **Progressive Disclosure**: Information revealed as needed
3. **Feedback**: Immediate visual/audio feedback on interactions
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Performance**: Sub-second page loads, smooth 60fps animations

### Responsive Design

- **Mobile**: Single-column layout, touch-optimized
- **Tablet**: Two-column grid, larger touch targets
- **Desktop**: Full multi-column layout, hover effects
- **4K+**: Centered content, optimal reading width

---

## ⚡ Performance

### Metrics

- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: ~200KB (gzipped)

### Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Font-display: swap for faster rendering
- **Tree Shaking**: Unused code eliminated
- **Asset Compression**: Brotli/Gzip compression
- **Caching**: Long-term caching for static assets

---

## 👥 Credits

### Game Design & Development

- **Szoleczki Zoltán** - Game Creator, Developer
- **Beró Zsolt** - Game Creator, Designer

### Technical Implementation

- **Frontend Development**: React, TypeScript, Tailwind CSS
- **UI/UX Design**: Figma, Adobe Suite
- **Audio Production**: Hungarian voice narration
- **Question Curation**: Research and fact-checking

### Open Source

This project leverages dozens of open-source libraries. Special thanks to:

- React Team
- Vercel (Vite creators)
- Radix UI Team
- Tailwind Labs
- Framer Motion Team

---

## 📄 License

### Code License

This project's code is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

```
MIT License

Copyright (c) 2025 Szoleczki Zoltán & Beró Zsolt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

### Game Content

HUMBUG! game concept, name, rules, and original content:
**© 2025 Szoleczki Zoltán & Beró Zsolt. All rights reserved.**

### Third-Party Licenses

Dependencies maintain their respective licenses. See `node_modules/` for details.

---

## 🤝 Contributing

We welcome contributions! However, please note:

1. **Game Content**: Contact creators before modifying game rules/questions
2. **Code**: Submit PRs for bug fixes and improvements
3. **Design**: Maintain the established visual language
4. **Localization**: Hungarian primary language; translations welcome

---

## 📞 Contact

- **GitHub**: [@szolzol](https://github.com/szolzol)
- **Issues**: [GitHub Issues](https://github.com/szolzol/humbug-quiz/issues)
- **Website**: [Live Demo](https://humbug-quiz.vercel.app)

---

## 🎯 Roadmap

### Planned Features

- [ ] English language version
- [ ] Question submission system
- [ ] Online multiplayer mode
- [ ] Mobile app (React Native)
- [ ] Score tracking and leaderboards
- [ ] Custom question pack creator
- [ ] Print-at-home card deck
- [ ] Tournament mode

---

## 🙏 Acknowledgments

Special thanks to everyone who playtested HUMBUG! and provided feedback. Your insights made this game what it is today.

---

<div align="center">

**[⬆ Back to Top](#-humbug-quiz-party-game---official-landing-page)**

Made with ❤️ for quiz lovers and bluffing masters

**FAKE IT TILL YOU WIN IT** 🎲

</div>
