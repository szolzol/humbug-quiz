import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "@/i18n";

/**
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role?: "free" | "premium" | "admin" | "creator";
}

/**
 * Auth context type definition
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Manages authentication state for the entire app
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check session on mount and periodically
   */
  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include", // Include cookies
      });

      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize session check on mount
   */
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Login function - redirects to Google OAuth
   * Preserves current URL path and params for post-auth redirect
   */
  const login = () => {
    const currentLang = i18n.language || "en";

    // Save language to localStorage (survives redirects reliably)
    localStorage.setItem("pre_auth_lang", currentLang);
    console.log(`🌐 Saving language to localStorage: ${currentLang}`);

    // Build URL with guaranteed lang parameter
    let returnUrl = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Always ensure lang parameter is present
    params.set("lang", currentLang);

    const queryString = params.toString();
    if (queryString) {
      returnUrl += "?" + queryString;
    }

    console.log(`🔗 Saving return URL: ${returnUrl}`);
    localStorage.setItem("auth_return_url", returnUrl);

    window.location.href = "/api/auth/google";
  };

  /**
   * Logout function - clears session and refreshes state
   */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * Manually refresh session (useful after login redirect)
   */
  const refreshSession = async () => {
    setIsLoading(true);
    await checkSession();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
