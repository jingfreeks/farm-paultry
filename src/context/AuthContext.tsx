"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Ensure user_profile exists (fallback if trigger failed)
        if (session?.user && (event === 'SIGNED_IN' || event === 'SIGNED_UP' || event === 'TOKEN_REFRESHED')) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', session.user.id)
              .single();

            // If profile doesn't exist, create it
            if (profileError && profileError.code === 'PGRST116') {
              const { error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || null,
                  role: 'customer',
                  is_active: true,
                });

              if (insertError) {
                console.warn('Failed to create user profile on auth state change:', insertError);
              }
            }
          } catch (profileCheckError) {
            console.warn('Error checking/creating user profile on auth state change:', profileCheckError);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error as Error };
      }

      // Ensure user_profile and customer records are created (fallback if trigger fails)
      if (data.user) {
        try {
          // Wait a bit for the trigger to run, then check if profile exists
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          // If profile doesn't exist, create it
          if (profileError && profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                full_name: fullName || data.user.user_metadata?.full_name || null,
                role: 'customer',
                is_active: true,
              });

            if (insertError) {
              console.warn('Failed to create user profile:', insertError);
            }
          }

          // Also ensure customer record exists
          if (data.user.email) {
            try {
              // Check if customer exists
              const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('id')
                .eq('email', data.user.email)
                .single();

              // If customer doesn't exist, create it
              if (customerError && customerError.code === 'PGRST116') {
                // Check if user_profile_id column exists
                const { data: profileForCustomer } = await supabase
                  .from('user_profiles')
                  .select('id')
                  .eq('id', data.user.id)
                  .single();

                const customerData: any = {
                  email: data.user.email,
                  full_name: fullName || data.user.user_metadata?.full_name || null,
                };

                // Add user_profile_id if column exists and we have a profile
                if (profileForCustomer) {
                  customerData.user_profile_id = data.user.id;
                }

                const { error: customerInsertError } = await supabase
                  .from('customers')
                  .insert(customerData);

                if (customerInsertError) {
                  console.warn('Failed to create customer record:', customerInsertError);
                }
              }
            } catch (customerCheckError) {
              console.warn('Error checking/creating customer record:', customerCheckError);
            }
          }
        } catch (profileCheckError) {
          console.warn('Error checking/creating user profile:', profileCheckError);
          // Don't fail signup if profile check fails
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

