import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark";

import App from "./App.tsx";
import { ErrorFallback } from "./ErrorFallback.tsx";
import "./i18n";

import "./main.css";
import "./styles/theme.css";
import "./index.css";

// Register service worker for PWA offline support
import { registerServiceWorker } from "./serviceWorkerRegistration";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);

// Register service worker in production
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => {
      console.log("Content is cached for offline use.");
    },
    onUpdate: () => {
      console.log("New content is available; please refresh.");
    },
    onOfflineReady: () => {
      console.log("App is ready to work offline.");
    },
  });
}
