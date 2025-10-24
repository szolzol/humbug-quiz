import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useUrlState } from "@/hooks/useUrlState";
import { Globe } from "@phosphor-icons/react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const urlState = useUrlState();

  const changeLanguage = (newLang: "en" | "hu") => {
    console.log(`🌐 LanguageSwitcher: Changing language to ${newLang}`);

    // Update i18n
    i18n.changeLanguage(newLang);

    // Update localStorage
    localStorage.setItem("language", newLang);

    // Update URL
    urlState.setState({ lang: newLang });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="bg-background/90 backdrop-blur-sm hover:bg-background border-2 border-primary/20 hover:border-primary/40 font-bold shadow-lg transition-all duration-300 hover:scale-105">
            <Globe className="mr-1.5 h-4 w-4" weight="bold" />
            <span className="text-sm text-foreground">
              {i18n.language === "hu" ? "HU" : "EN"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[120px] bg-background/95 backdrop-blur-sm border-2 border-primary/20">
          <DropdownMenuItem
            onClick={() => changeLanguage("en")}
            className={`cursor-pointer font-medium ${
              i18n.language === "en"
                ? "bg-primary/10 text-primary"
                : "text-foreground"
            }`}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeLanguage("hu")}
            className={`cursor-pointer font-medium ${
              i18n.language === "hu"
                ? "bg-primary/10 text-primary"
                : "text-foreground"
            }`}>
            Magyar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
