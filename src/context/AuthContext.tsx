import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
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
    // Save current URL (path + search params) to restore after OAuth
    const returnUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("auth_return_url", returnUrl);

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
