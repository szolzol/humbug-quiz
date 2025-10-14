// Service Worker Registration
// Registers the service worker and handles updates

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

export function registerServiceWorker(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[SW] Service worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  console.log('[SW] New content is available; please refresh.');
                  
                  if (config?.onUpdate) {
                    config.onUpdate(registration);
                  } else {
                    // Show default update notification
                    showUpdateNotification(registration);
                  }
                } else {
                  // Content is cached for offline use
                  console.log('[SW] Content is cached for offline use.');
                  
                  if (config?.onOfflineReady) {
                    config.onOfflineReady();
                  }
                  
                  if (config?.onSuccess) {
                    config.onSuccess(registration);
                  }
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[SW] Service worker registration failed:', error);
        });
    });
  } else {
    console.log('[SW] Service workers are not supported in this browser.');
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('[SW] Service worker unregistered');
      })
      .catch((error) => {
        console.error('[SW] Error unregistering service worker:', error);
      });
  }
}

function showUpdateNotification(registration: ServiceWorkerRegistration) {
  const updateMessage = document.createElement('div');
  updateMessage.id = 'sw-update-notification';
  updateMessage.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: oklch(0.85 0.18 90);
    color: oklch(0.15 0.1 240);
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: 'Space Grotesk', sans-serif;
    display: flex;
    gap: 12px;
    align-items: center;
    max-width: 400px;
  `;

  updateMessage.innerHTML = `
    <div style="flex: 1;">
      <strong style="display: block; margin-bottom: 4px;">New version available!</strong>
      <span style="font-size: 14px;">Click to update and reload.</span>
    </div>
    <button id="sw-update-btn" style="
      background: oklch(0.15 0.1 240);
      color: oklch(0.98 0 0);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    ">
      Update
    </button>
    <button id="sw-dismiss-btn" style="
      background: transparent;
      color: oklch(0.15 0.1 240);
      border: 1px solid oklch(0.15 0.1 240);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    ">
      Later
    </button>
  `;

  document.body.appendChild(updateMessage);

  const updateBtn = document.getElementById('sw-update-btn');
  const dismissBtn = document.getElementById('sw-dismiss-btn');

  updateBtn?.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  });

  dismissBtn?.addEventListener('click', () => {
    updateMessage.remove();
  });
}

// Check if the app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Get service worker registration status
export async function getServiceWorkerStatus(): Promise<string> {
  if (!('serviceWorker' in navigator)) {
    return 'not-supported';
  }

  const registration = await navigator.serviceWorker.getRegistration();
  
  if (!registration) {
    return 'not-registered';
  }

  if (registration.waiting) {
    return 'waiting';
  }

  if (registration.installing) {
    return 'installing';
  }

  if (registration.active) {
    return 'active';
  }

  return 'unknown';
}
