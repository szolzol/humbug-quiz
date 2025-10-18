import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginButton } from "@/components/LoginButton";
import { QuestionPackSelector } from "@/components/QuestionPackSelector";
import { motion } from "framer-motion";

interface HeaderProps {
  currentPack: string;
  onPackChange: (packSlug: string) => void;
}

export const Header = ({ currentPack, onPackChange }: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 shadow-lg"
      style={{
        backgroundColor: "rgba(21, 21, 31, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left side - Hamburger Menu + Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <QuestionPackSelector
              variant="hamburger"
              currentPack={currentPack}
              onPackChange={onPackChange}
            />
            <LanguageSwitcher />
          </div>

          {/* Right side - Login Button */}
          <div className="flex items-center flex-shrink-0">
            <LoginButton variant="full" />
          </div>
        </div>
      </div>
    </motion.header>
  );
};
