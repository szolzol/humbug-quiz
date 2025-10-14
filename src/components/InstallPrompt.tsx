import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = Math.floor(
        (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // For Android and other browsers that support beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds delay (non-intrusive)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show manual instruction after 3 seconds
    if (iOS) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome install flow
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("install-prompt-dismissed", new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-[9999] md:hidden"
        role="dialog"
        aria-labelledby="install-prompt-title"
        aria-describedby="install-prompt-description">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.25_0.1_240)] to-[oklch(0.15_0.1_240)] p-4 shadow-2xl border border-[oklch(0.75_0.15_85)]/20">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.75_0.15_85)]/10 to-transparent opacity-50 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={t("installPrompt.close") || "Close"}>
            <X size={20} weight="bold" className="text-white/70" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.75_0.15_85)] to-[oklch(0.85_0.18_90)] flex items-center justify-center shadow-lg">
              <Download size={24} weight="bold" className="text-[oklch(0.15_0.1_240)]" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3
                id="install-prompt-title"
                className="text-base font-semibold text-white mb-1">
                {t("installPrompt.title") || "Install HUMBUG!"}
              </h3>
              <p
                id="install-prompt-description"
                className="text-sm text-white/80 mb-3">
                {isIOS
                  ? t("installPrompt.descriptionIOS") ||
                    "Tap Share, then 'Add to Home Screen'"
                  : t("installPrompt.description") ||
                    "Quick access from your home screen"}
              </p>

              {/* Install button (only for non-iOS) */}
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.15_85)] to-[oklch(0.85_0.18_90)] text-[oklch(0.15_0.1_240)] font-semibold text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t("installPrompt.install") || "Install Now"}
                </button>
              )}

              {/* iOS instruction */}
              {isIOS && (
                <div className="flex items-center gap-2 text-xs text-[oklch(0.75_0.15_85)] font-medium">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
                  </svg>
                  <span>
                    {t("installPrompt.tapShare") ||
                      "Tap the share button below"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Later button */}
          <button
            onClick={handleDismiss}
            className="mt-3 w-full py-2 text-sm text-white/60 hover:text-white/90 transition-colors">
            {t("installPrompt.later") || "Maybe later"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
