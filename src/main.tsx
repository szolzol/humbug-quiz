import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@github/spark/spark";

import App from "./App.tsx";
import { ErrorFallback } from "./ErrorFallback.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AdminLayout } from "./components/admin/AdminLayout.tsx";
import { AdminDashboard } from "./pages/AdminDashboard.tsx";
import { UsersPage } from "./pages/UsersPage.tsx";
import { QuestionsPage } from "./pages/QuestionsPage.tsx";
import { PacksPage } from "./pages/PacksPage.tsx";
import { ActivityPage } from "./pages/ActivityPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { MultiplayerPage } from "./pages/MultiplayerPage.tsx";
import PlayerProfile from "./components/PlayerProfile.tsx";
import "./i18n";

import "./main.css";
import "./styles/theme.css";
import "./index.css";

// Register service worker for PWA offline support
import { registerServiceWorker } from "./serviceWorkerRegistration";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Profile Route */}
          <Route path="/profile" element={<PlayerProfile />} />

          {/* Multiplayer Route */}
          <Route path="/multiplayer" element={<MultiplayerPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="packs" element={<PacksPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Main Quiz App Route */}
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);

// Register service worker in production
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => {},
    onUpdate: () => {},
    onOfflineReady: () => {},
  });
}
