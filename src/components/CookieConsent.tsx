import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

/**
 * CookieConsent Component
 * Displays a GDPR-compliant cookie consent banner
 * Stores consent in localStorage (ironically, this is allowed without consent for consent management)
 */
export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    // Clear any existing functional cookies/localStorage (except consent itself)
    const consentValue = localStorage.getItem("cookie_consent");
    const consentDate = localStorage.getItem("cookie_consent_date");
    localStorage.clear();
    if (consentValue) localStorage.setItem("cookie_consent", consentValue);
    if (consentDate) localStorage.setItem("cookie_consent_date", consentDate);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-background/95 backdrop-blur-md border-2 border-primary/30 rounded-2xl shadow-2xl p-6 md:p-8">
              {/* Close button */}
              <button
                onClick={handleReject}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close">
                <X size={20} weight="bold" />
              </button>

              {/* Content */}
              <div className="pr-8">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>🍪</span>
                  {t("cookies.title")}
                </h3>

                <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                  {t("cookies.description")}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAccept}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all">
                    {t("cookies.acceptAll")}
                  </Button>
                  <Button
                    onClick={handleReject}
                    size="lg"
                    variant="outline"
                    className="flex-1 border-2 border-primary/30 hover:border-primary/60 font-semibold">
                    {t("cookies.rejectOptional")}
                  </Button>
                </div>

                {/* Privacy info */}
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  <button
                    onClick={() => setIsPrivacyOpen(true)}
                    className="underline hover:text-foreground transition-colors">
                    {t("cookies.privacyInfo")}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicy
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </AnimatePresence>
  );
}
