import { useEffect, useState } from "react";

export interface AdminAuthStatus {
  hasAccess: boolean;
  role: "admin" | "creator" | "free" | "premium" | null;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
  } | null;
}

/**
 * Hook to check if current user has admin access
 * Does not auto-redirect - consumer decides what to do
 */
export function useAdminAuth(): AdminAuthStatus {
  const [authStatus, setAuthStatus] = useState<AdminAuthStatus>({
    hasAccess: false,
    role: null,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const response = await fetch("/api/admin/auth/check", {
          credentials: "include",
        });

        const data = await response.json();

        setAuthStatus({
          hasAccess: data.hasAccess,
          role: data.role,
          isLoading: false,
          user: data.user,
        });
      } catch (error) {
        console.error("❌ Admin auth check failed:", error);
        setAuthStatus({
          hasAccess: false,
          role: null,
          isLoading: false,
          user: null,
        });
      }
    }

    checkAdminAccess();
  }, []);

  return authStatus;
}
