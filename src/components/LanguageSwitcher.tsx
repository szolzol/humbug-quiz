import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useUrlState } from "@/hooks/useUrlState";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const urlState = useUrlState();

  const toggleLanguage = () => {
    const newLang = i18n.language === "hu" ? "en" : "hu";
    console.log(`🌐 LanguageSwitcher: Changing language to ${newLang}`);

    // Update i18n
    i18n.changeLanguage(newLang);

    // Update localStorage
    localStorage.setItem("language", newLang);

    // Update URL
    urlState.setState({ lang: newLang as "en" | "hu" });
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
        <span className="text-sm text-foreground">
          {i18n.language === "hu" ? "HU" : "EN"}
        </span>
      </Button>
    </motion.div>
  );
}
