/**
 * Admin Layout Component
 * Provides the main layout structure for the admin panel with sidebar navigation
 */

import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Package,
  Activity,
  Settings,
  ArrowLeft,
  LogOut,
  Crown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <Users size={20} />,
  },
  {
    label: "Questions",
    path: "/admin/questions",
    icon: <BookOpen size={20} />,
  },
  {
    label: "Question Packs",
    path: "/admin/packs",
    icon: <Package size={20} />,
  },
  {
    label: "Activity Log",
    path: "/admin/activity",
    icon: <Activity size={20} />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <Settings size={20} />,
  },
];

export function AdminLayout() {
  const { hasAccess, isLoading, user, role } = useAdminAuth();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔐</div>
          <p className="text-lg text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="mb-6 text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2" size={16} />
            Back to Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="border-b p-6">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Crown className="text-yellow-500" size={24} />
              Admin Panel
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* User Info */}
          <div className="p-4">
            <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal uppercase">
                    {role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2" size={16} />
                Exit Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={logout}>
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
