# 🤖 AI Agents Development Notes

This document contains important learnings, considerations, and best practices discovered during the development of the HUMBUG! Quiz Party Game landing page. These notes are intended to help AI agents and developers maintain consistency and avoid common pitfalls.

---

### VSCode instructions

- NEVER interrupt a running dev server, always check background terminals for running servers and run any commands in a new terminal window
- Always expose local dev server on the local network
- Always update README.MD file after key changes
- Buildelni nem kell, tesztelni a dev server indításával tesztelj..

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

### Common AI Assistant Mistakes to Avoid

- ❌ Assuming browser APIs work the same on mobile
- ❌ Forgetting to update both language files
- ❌ Not testing with actual devices
- ❌ Overriding Tailwind with inline styles
- ❌ Ignoring accessibility requirements
- ❌ Adding dependencies without checking bundle size

### Prompt Engineering Tips

When asking for help:

- ✅ Mention you're working on a React + TypeScript + Vite project
- ✅ Specify if it's for mobile or desktop
- ✅ Include relevant code context
- ✅ Mention if internationalization is affected
- ✅ Ask for explanations, not just code

---

<div align="center">

**Last Updated**: January 2025

_This document should be updated as the project evolves_

</div>
