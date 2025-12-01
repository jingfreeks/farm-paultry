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
        
        // When user signs in, ensure customer record exists
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: existingCustomer } = await supabase
              .from('customers')
              .select('id')
              .eq('email', session.user.email!)
              .single();

            if (!existingCustomer) {
              // Create customer record if it doesn't exist
              await supabase
                .from('customers')
                .insert({
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || null,
                });
            }
          } catch (err) {
            console.error('Error ensuring customer record:', err);
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

      // If signup successful, create customer record
      if (data.user) {
        try {
          // Wait a bit for the trigger to create user_profile first
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create customer record
          const { error: customerError } = await supabase
            .from('customers')
            .insert({
              email: data.user.email!,
              full_name: fullName || null,
            })
            .select()
            .single();

          // If customer already exists (upsert), update it
          if (customerError && customerError.code === '23505') {
            // Unique constraint violation - customer exists, update it
            const { error: updateError } = await supabase
              .from('customers')
              .update({
                full_name: fullName || null,
                updated_at: new Date().toISOString(),
              })
              .eq('email', email);

            if (updateError) {
              console.error('Error updating customer:', updateError);
            }
          } else if (customerError) {
            console.error('Error creating customer:', customerError);
            // Don't fail signup if customer creation fails
          }
        } catch (err) {
          console.error('Error in customer creation:', err);
          // Don't fail signup if customer creation fails
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

