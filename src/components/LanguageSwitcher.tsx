import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "hu" ? "en" : "hu";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}>
      <Button
        onClick={toggleLanguage}
        size="sm"
        variant="outline"
        className="bg-background/90 backdrop-blur-sm hover:bg-background border-2 border-primary/20 hover:border-primary/40 font-bold shadow-lg transition-all duration-300 hover:scale-105">
        <span className="text-sm text-foreground">{i18n.language === "hu" ? "HU" : "EN"}</span>
      </Button>
    </motion.div>
  );
}
