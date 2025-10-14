# 🚀 Progressive Web App (PWA) Implementation

This document describes the PWA and service worker implementation for HUMBUG! Quiz Party Game.

## 📋 Overview

The app is now a fully functional Progressive Web App with offline support, allowing users to:
- Install the app on their device (mobile/desktop)
- Access the app offline after the first visit
- Receive automatic updates when new versions are available
- Enjoy improved performance through intelligent caching

---

## 🏗️ Architecture

### **Files Structure**

```
public/
├── sw.js                    # Service worker implementation
├── manifest.json            # PWA manifest configuration
└── icons/                   # App icons for various platforms

src/
└── serviceWorkerRegistration.ts  # Service worker registration logic

src/main.tsx                 # Service worker initialization
```

---

## 🔧 Service Worker Strategy

### **Cache-First Strategy**

The service worker uses a **Cache-First** strategy with network fallback:

1. **Precaching (Install Phase)**
   - Static assets (HTML, fonts, icons)
   - Cached immediately when service worker installs
   - Version-controlled cache name: `humbug-quiz-v1`

2. **Runtime Caching (Fetch Phase)**
   - JavaScript bundles
   - CSS files
   - Images
   - Cached on first request
   - Separate cache: `humbug-quiz-runtime-v1`

3. **Network Fallback**
   - If asset not in cache, fetch from network
   - Cache the response for future use
   - Return offline page if network fails

---

## 📦 Cached Assets

### **Precached on Install:**
```javascript
- /                              (Root HTML)
- /index.html
- /manifest.json
- /icon.svg
- /icon-192x192.png
- /icon-512x512.png
- /fonts/SpaceGrotesk-*.ttf     (All font weights)
```

### **Runtime Cached:**
```javascript
- /assets/*.js                  (JavaScript bundles)
- /assets/*.css                 (CSS files)
- Images: .png, .jpg, .jpeg, .svg, .webp, .gif
- Fonts: .ttf, .woff, .woff2
```

---

## 🔄 Update Mechanism

### **Automatic Update Detection**
- Service worker checks for updates **every hour**
- Users receive notification when new version available
- Two options:
  1. **Update Now** - Immediately apply update and reload
  2. **Later** - Continue using current version

### **Update Notification UI**
```
┌─────────────────────────────────────┐
│ New version available!              │
│ Click to update and reload.         │
│                                     │
│  [Update]  [Later]                 │
└─────────────────────────────────────┘
```

---

## 🎨 Manifest Configuration

### **PWA Settings:**
```json
{
  "name": "HUMBUG! Quiz Party Game",
  "short_name": "HUMBUG!",
  "display": "standalone",
  "background_color": "#15151f",
  "theme_color": "#d4af37",
  "orientation": "portrait-primary"
}
```

### **Display Modes:**
- **Standalone**: Runs in its own window (like native app)
- No browser UI (address bar, back button)
- Full-screen experience on mobile

---

## 📱 Installation

### **Mobile (Android/iOS)**
1. Visit site in mobile browser
2. Browser shows "Add to Home Screen" prompt
3. Tap to install
4. App icon appears on home screen
5. Launch like native app

### **Desktop (Chrome/Edge)**
1. Visit site in browser
2. Install icon appears in address bar
3. Click to install
4. App opens in standalone window
5. Accessible from Start Menu/Applications

---

## 🧪 Testing PWA

### **Lighthouse PWA Audit**
```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"
```

**Expected Scores:**
- ✅ Installable
- ✅ PWA Optimized
- ✅ Offline support
- ✅ Fast and reliable

### **Manual Testing**

1. **Test Offline Mode:**
   ```bash
   # In Chrome DevTools:
   Network tab → Throttling → Offline
   Reload page → Should work offline
   ```

2. **Test Installation:**
   - Desktop: Click install icon in address bar
   - Mobile: Use "Add to Home Screen" option

3. **Test Updates:**
   ```bash
   # Change cache version in sw.js
   # Reload app
   # Should show update notification
   ```

---

## 🔍 Service Worker Registration

### **Production Only**
Service worker only registers in **production builds**:

```typescript
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => console.log('Ready for offline use'),
    onUpdate: () => console.log('New version available'),
    onOfflineReady: () => console.log('App ready offline')
  });
}
```

### **Development Mode**
- Service worker **not active** in development
- Use `npm run build && npm run preview` to test PWA features

---

## 📊 Performance Impact

### **Benefits:**
- **Faster load times** (cached assets)
- **Offline functionality** (works without network)
- **Reduced bandwidth** (fewer network requests)
- **Better UX** (instant page loads on repeat visits)

### **Metrics:**
- First visit: ~165KB JS + 40KB CSS
- Repeat visits: Load from cache (0KB network)
- Offline: Full functionality

---

## 🛠️ Development Commands

### **Build with Service Worker:**
```bash
npm run build
```

### **Test PWA Locally:**
```bash
npm run build
npm run preview
# Visit http://localhost:4173
```

### **Unregister Service Worker (if needed):**
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));
```

---

## 🔄 Updating Cache Version

When deploying new version:

1. **Update cache version** in `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'humbug-quiz-v2'; // Increment version
   const RUNTIME_CACHE = 'humbug-quiz-runtime-v2';
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   git add .
   git commit -m "chore: update service worker cache version"
   git push
   ```

3. **Users receive update notification** automatically

---

## 🐛 Troubleshooting

### **Service Worker Not Updating**
```javascript
// Force update in console:
navigator.serviceWorker.getRegistration()
  .then(reg => reg?.update());
```

### **Clear All Caches**
```javascript
// In console:
caches.keys().then(keys => 
  Promise.all(keys.map(key => caches.delete(key)))
);
```

### **Check Service Worker Status**
```javascript
// In console:
import { getServiceWorkerStatus } from './serviceWorkerRegistration';
const status = await getServiceWorkerStatus();
console.log('SW Status:', status);
```

---

## 📚 Resources

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web.dev: Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Chrome DevTools: PWA](https://developer.chrome.com/docs/devtools/progressive-web-apps/)
- [Lighthouse PWA Audit](https://developer.chrome.com/docs/lighthouse/pwa/)

---

## ✅ Checklist

PWA Implementation Status:

- [x] Service worker created
- [x] Manifest.json configured
- [x] Icons generated (192x192, 512x512, SVG)
- [x] Offline support enabled
- [x] Update notifications implemented
- [x] Cache versioning configured
- [x] Production-only registration
- [x] Documentation complete

---

## 🎯 Next Steps

1. **Test on Real Devices**
   - Install on Android phone
   - Install on iPhone
   - Install on desktop Chrome/Edge

2. **Monitor Performance**
   - Run Lighthouse audits regularly
   - Track cache hit rates
   - Monitor update adoption

3. **Optimize Further**
   - Add push notifications (future)
   - Implement background sync (future)
   - Add offline game features (future)

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0
