import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  const { t } = useTranslation();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 max-h-[calc(100vh-32px)] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[85vh] z-[101] flex flex-col bg-background border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("privacy.title")}
              </h2>
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-background/50">
                <X size={24} weight="bold" />
              </Button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
              style={{ minHeight: 0, flex: "1 1 0%" }}>
              <div className="space-y-6 text-sm md:text-base text-muted-foreground px-6 py-6 pb-8">
                {/* Last Updated */}
                <p className="text-xs text-muted-foreground/70">
                  {t("privacy.lastUpdated")}: 2025-10-16
                </p>

                {/* Introduction */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.intro.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.intro.content")}
                  </p>
                </section>

                {/* Data Controller */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.controller.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.controller.content")}
                  </p>
                </section>

                {/* Data We Collect */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.dataCollected.title")}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t("privacy.dataCollected.auth.title")}
                      </h4>
                      <p className="leading-relaxed">
                        {t("privacy.dataCollected.auth.content")}
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                        <li>{t("privacy.dataCollected.auth.item1")}</li>
                        <li>{t("privacy.dataCollected.auth.item2")}</li>
                        <li>{t("privacy.dataCollected.auth.item3")}</li>
                        <li>{t("privacy.dataCollected.auth.item4")}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t("privacy.dataCollected.gameState.title")}
                      </h4>
                      <p className="leading-relaxed">
                        {t("privacy.dataCollected.gameState.content")}
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                        <li>{t("privacy.dataCollected.gameState.item1")}</li>
                        <li>{t("privacy.dataCollected.gameState.item2")}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Cookies */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.cookies.title")}
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-card/30 border border-border/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {t("privacy.cookies.necessary.title")}
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {t("privacy.cookies.necessary.description")}
                      </p>
                      <p className="text-xs mt-2 font-mono bg-muted/50 px-2 py-1 rounded">
                        auth_token: {t("privacy.cookies.necessary.purpose")}
                      </p>
                    </div>
                    <div className="bg-card/30 border border-border/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        <span className="text-blue-500">⚙</span>
                        {t("privacy.cookies.functional.title")}
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {t("privacy.cookies.functional.description")}
                      </p>
                      <ul className="text-xs mt-2 space-y-1 font-mono bg-muted/50 px-2 py-1 rounded">
                        <li>
                          flip_[lang]_[id]:{" "}
                          {t("privacy.cookies.functional.flip")}
                        </li>
                        <li>
                          answers_[lang]_[id]:{" "}
                          {t("privacy.cookies.functional.answers")}
                        </li>
                        <li>
                          cookie_consent:{" "}
                          {t("privacy.cookies.functional.consent")}
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Legal Basis */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.legalBasis.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.legalBasis.content")}
                  </p>
                </section>

                {/* Data Sharing */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.dataSharing.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.dataSharing.content")}
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>
                      <strong>Google LLC:</strong>{" "}
                      {t("privacy.dataSharing.google")}
                    </li>
                    <li>
                      <strong>Vercel Inc.:</strong>{" "}
                      {t("privacy.dataSharing.vercel")}
                    </li>
                  </ul>
                </section>

                {/* Your Rights */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.rights.title")}
                  </h3>
                  <p className="leading-relaxed mb-2">
                    {t("privacy.rights.intro")}
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>{t("privacy.rights.access")}</li>
                    <li>{t("privacy.rights.rectification")}</li>
                    <li>{t("privacy.rights.erasure")}</li>
                    <li>{t("privacy.rights.restrict")}</li>
                    <li>{t("privacy.rights.portability")}</li>
                    <li>{t("privacy.rights.object")}</li>
                    <li>{t("privacy.rights.withdraw")}</li>
                  </ul>
                </section>

                {/* Data Retention */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.retention.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.retention.content")}
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.contact.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.contact.content")}
                  </p>
                </section>

                {/* Changes */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("privacy.changes.title")}
                  </h3>
                  <p className="leading-relaxed">
                    {t("privacy.changes.content")}
                  </p>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-border/50 bg-muted/20">
              <Button
                onClick={onClose}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                {t("privacy.close")}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
