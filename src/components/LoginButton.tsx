import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

/**
 * LoginButton Component
 * Displays Google login button when logged out
 * Shows user avatar and dropdown menu when logged in
 */
interface LoginButtonProps {
  /**
   * Display variant:
   * - 'default': Shows icon on mobile, text on desktop
   * - 'full': Always shows full text with icon
   */
  variant?: "default" | "full";
}

export function LoginButton({ variant = "default" }: LoginButtonProps) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const { t } = useTranslation();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border-2 border-primary/20 shadow-lg animate-pulse">
        <div className="w-6 h-6 rounded-full bg-primary/20" />
        <div className="w-16 h-3 rounded bg-primary/20 hidden sm:block" />
      </div>
    );
  }

  // Logged out state - Show Google login button
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}>
        <Button
          onClick={login}
          size="sm"
          variant="outline"
          className="bg-background/90 backdrop-blur-sm hover:bg-background border-2 border-primary/20 hover:border-primary/40 font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
          {/* Google Logo SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </g>
          </svg>
          <span
            className={`text-sm text-foreground ${
              variant === "full" ? "" : "hidden sm:inline"
            }`}>
            {t("auth.signIn")}
          </span>
        </Button>
      </motion.div>
    );
  }

  // Logged in state - Show user avatar and dropdown
  // Safety check (should not happen due to isAuthenticated check)
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-2 py-2 rounded-lg bg-background/90 backdrop-blur-sm hover:bg-background border-2 border-primary/20 hover:border-primary/40 font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <img
            src={user.picture}
            alt={user.name}
            className="w-6 h-6 rounded-full border-2 border-primary"
          />
          <span
            className={`text-sm text-foreground ${
              variant === "full" ? "" : "hidden sm:inline"
            }`}>
            {user.name}
          </span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
