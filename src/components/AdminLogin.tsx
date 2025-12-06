"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

// Demo admin credentials (for development/testing)
const DEMO_ADMIN = {
  email: "admin@goldenharvest.com",
  password: "admin123",
};

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoHint, setShowDemoHint] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Always check demo credentials first (works even when Supabase is configured)
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      // Store demo login in localStorage
      localStorage.setItem("demo_admin_logged_in", "true");
      localStorage.setItem("demo_admin_email", email);
      setLoading(false);
      onLoginSuccess();
      return;
    }

    // If not demo credentials and Supabase is not configured, show error
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Invalid credentials. Please use the demo admin account.");
      setShowDemoHint(true);
      setLoading(false);
      return;
    }

    // Try Supabase authentication
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If Supabase auth fails, show error with demo hint
        setError(authError.message || "Invalid credentials. Please check your email and password.");
        setShowDemoHint(true);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          
          // If profile doesn't exist (PGRST116 = no rows), try to create it
          if (profileError.code === 'PGRST116') {
            console.log("Profile not found, attempting to create admin profile...");
            
            // Try to create profile with admin role
            const { error: insertError } = await supabase
              .from("user_profiles")
              .insert({
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || null,
                role: 'admin', // Default to admin for first user
                is_active: true,
              });

            if (insertError) {
              console.error("Failed to create profile:", insertError);
              // If insert fails (likely RLS), show helpful error
              await supabase.auth.signOut();
              setError("User profile not found and could not be created automatically. Please run the database migration to create your admin profile.");
              setShowDemoHint(true);
              setLoading(false);
              return;
            } else {
              console.log("Admin profile created successfully");
              // Profile created, wait a moment for state to propagate
              await new Promise(resolve => setTimeout(resolve, 100));
              onLoginSuccess();
              setLoading(false);
              return;
            }
          } else {
            // Other error, sign out and show error
            await supabase.auth.signOut();
            setError("User profile not found. Please contact an administrator.");
            setShowDemoHint(true);
            setLoading(false);
            return;
          }
        }

        if (profile?.role === "admin" || profile?.role === "staff") {
          // Wait a moment for auth state to propagate, then call success callback
          await new Promise(resolve => setTimeout(resolve, 100));
          onLoginSuccess();
        } else {
          await supabase.auth.signOut();
          setError("You don't have admin access. Contact an administrator.");
          setShowDemoHint(true);
          setLoading(false);
        }
      } else {
        // No user data returned
        setError("Login failed. Please try again.");
        setShowDemoHint(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setShowDemoHint(true);
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark via-bark to-olive-dark flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-t-3xl p-8 text-center border-b border-white/10">
          <div className="w-20 h-20 bg-olive rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-cream" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1.5 3.5-1 .5-2 1.5-2.5 3-.5 1.5 0 3 1 4 1 1 2.5 1.5 4 1.5h4c1.5 0 3-.5 4-1.5s1.5-2.5 1-4c-.5-1.5-1.5-2.5-2.5-3 1-1 1.5-2 1.5-3.5 0-2.5-2.5-5-6-5zm-2 6c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm4 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm-2 4l-1 3h-2l2-4h1zm0 0l1 3h2l-2-4h-1z"/>
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-cream mb-2">Golden Harvest</h1>
          <p className="text-cream/70">Admin Dashboard</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-cream rounded-b-3xl p-8 shadow-2xl">
          <h2 className="font-serif text-2xl font-bold text-bark text-center mb-6">
            Sign In
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Demo Hint */}
          {showDemoHint && (
            <div className="mb-4 p-4 bg-olive/10 border border-olive/20 rounded-xl">
              <p className="text-sm text-bark font-medium mb-2">🔑 Demo Admin Credentials:</p>
              <div className="text-sm text-charcoal/70 space-y-1">
                <p>Email: <code className="bg-wheat px-2 py-0.5 rounded">{DEMO_ADMIN.email}</code></p>
                <p>Password: <code className="bg-wheat px-2 py-0.5 rounded">{DEMO_ADMIN.password}</code></p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="mt-3 text-sm text-olive font-medium hover:text-terracotta transition-colors"
              >
                → Click to fill credentials
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-wheat bg-white focus:border-olive focus:ring-2 focus:ring-olive/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-terracotta text-cream font-semibold rounded-xl hover:bg-terracotta-dark transition-colors shadow-lg shadow-terracotta/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowDemoHint(true)}
              className="text-sm text-olive font-medium hover:text-terracotta transition-colors underline"
            >
              Need help signing in? Click here for demo credentials
            </button>
          </div>

          {/* Always show demo credentials hint at the bottom */}
          <div className="mt-4 p-3 bg-olive/5 border border-olive/20 rounded-lg">
            <p className="text-xs text-charcoal/70 text-center">
              <span className="font-medium text-olive">Demo Mode:</span> Use <code className="bg-wheat px-1.5 py-0.5 rounded text-xs">{DEMO_ADMIN.email}</code> / <code className="bg-wheat px-1.5 py-0.5 rounded text-xs">{DEMO_ADMIN.password}</code>
            </p>
          </div>

          {/* Back to site */}
          <div className="mt-6 pt-6 border-t border-wheat text-center">
            <a
              href="/"
              className="text-sm text-olive font-medium hover:text-terracotta transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

