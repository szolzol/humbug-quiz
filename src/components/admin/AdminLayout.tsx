/**
 * Admin Layout Component
 * Provides the main layout structure for the admin panel with sidebar navigation
 */

import React, { useState } from "react";
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
  Menu,
  X,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation Bar - Desktop */}
      <header className="hidden lg:flex h-16 items-center justify-between border-b bg-card px-6">
        {/* Logo and Nav Items */}
        <div className="flex items-center gap-8">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-xl font-bold">
            <Crown className="text-yellow-500" size={24} />
            <span>Admin Panel</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.picture} alt={user?.name} />
              <AvatarFallback className="text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name}</span>
              <Badge
                variant="secondary"
                className="text-xs font-normal uppercase px-1.5 py-0">
                {role}
              </Badge>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            title="Exit Admin"
            className="h-8">
            <ArrowLeft size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Logout"
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      {/* Mobile Header with Menu Button */}
      <header className="flex lg:hidden h-16 items-center justify-between border-b bg-card px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </Button>

        <Link to="/admin" className="flex items-center gap-2 font-bold">
          <Crown className="text-yellow-500" size={20} />
          <span>Admin</span>
        </Link>

        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.picture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex h-full flex-col">
          {/* Mobile Logo/Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <Crown className="text-yellow-500" size={20} />
              Admin Panel
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}>
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

          {/* Mobile User Info */}
          <div className="p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-accent p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs font-normal uppercase">
                  {role}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
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
