"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/AdminLogin";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: "dashboard" },
  { name: "Orders", href: "/admin/orders", icon: "orders" },
  { name: "Products", href: "/admin/products", icon: "products" },
  { name: "Customers", href: "/admin/customers", icon: "customers" },
  { name: "Users", href: "/admin/users", icon: "users" },
  { name: "Settings", href: "/admin/settings", icon: "settings" },
];

const icons: Record<string, JSX.Element> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  products: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  customers: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zM17 14v6m3-3h-6" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, loading, userProfile, authUser, checkAuth, logout } = useAdminAuth();

  // Loading state with timeout fallback
  if (loading) {
    return (
      <div className="min-h-screen bg-bark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cream border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cream/70">Loading...</p>
          <p className="text-cream/50 text-sm mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={checkAuth} />;
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-wheat/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-bark mb-2">Access Denied</h1>
          <p className="text-charcoal/60 mb-6">
            Your account doesn&apos;t have admin privileges. Please contact an administrator.
          </p>
          <div className="flex gap-3">
            <button
              onClick={logout}
              className="flex-1 px-4 py-2 bg-wheat text-charcoal rounded-xl font-medium hover:bg-wheat/70 transition-colors"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="flex-1 px-4 py-2 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wheat/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-bark/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-bark transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-cream" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1.5 3.5-1 .5-2 1.5-2.5 3-.5 1.5 0 3 1 4 1 1 2.5 1.5 4 1.5h4c1.5 0 3-.5 4-1.5s1.5-2.5 1-4c-.5-1.5-1.5-2.5-2.5-3 1-1 1.5-2 1.5-3.5 0-2.5-2.5-5-6-5zm-2 6c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm4 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm-2 4l-1 3h-2l2-4h1zm0 0l1 3h2l-2-4h-1z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-cream">Golden Harvest</h1>
              <p className="text-xs text-cream/60">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        {(userProfile || authUser) && (
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-olive rounded-full flex items-center justify-center text-cream font-bold">
                {(authUser?.user_metadata?.full_name || userProfile?.full_name || authUser?.email || userProfile?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream truncate">
                  {authUser?.user_metadata?.full_name || userProfile?.full_name || authUser?.email || 'User'}
                </p>
                <p className="text-xs text-cream/60 capitalize">{userProfile?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-olive text-cream"
                    : "text-cream/70 hover:bg-white/10 hover:text-cream"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {icons[item.icon]}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-cream/70 hover:text-cream transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Site</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-wheat">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-wheat transition-colors"
            >
              <svg className="w-6 h-6 text-bark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title placeholder */}
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-wheat transition-colors">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-olive rounded-full flex items-center justify-center text-cream font-bold">
                  {(authUser?.user_metadata?.full_name || userProfile?.full_name || authUser?.email || userProfile?.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-bark">
                    {authUser?.user_metadata?.full_name || userProfile?.full_name || authUser?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-charcoal/60">{authUser?.email || userProfile?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
