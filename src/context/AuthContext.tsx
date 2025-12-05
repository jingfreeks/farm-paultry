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
          // Wait longer for the trigger to run, then check if records exist
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check and create user_profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            console.log('Profile not found, creating user_profile...');
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
              console.error('Failed to create user profile:', insertError);
            } else {
              console.log('User profile created successfully');
            }
          } else if (profile) {
            console.log('User profile already exists');
          }

          // Also ensure customer record exists
          if (data.user.email) {
            try {
              // Check if customer exists
              const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('id, email')
                .eq('email', data.user.email)
                .maybeSingle();

              // If customer doesn't exist, create it
              if (!customer && (customerError?.code === 'PGRST116' || !customerError)) {
                console.log('Customer not found, creating customer record...');
                
                // Ensure we have a profile first
                const { data: profileForCustomer } = await supabase
                  .from('user_profiles')
                  .select('id')
                  .eq('id', data.user.id)
                  .single();

                const customerData: any = {
                  email: data.user.email,
                  full_name: fullName || data.user.user_metadata?.full_name || null,
                };

                // Add user_profile_id if we have a profile
                if (profileForCustomer) {
                  customerData.user_profile_id = data.user.id;
                }

                const { error: customerInsertError, data: insertedCustomer } = await supabase
                  .from('customers')
                  .insert(customerData)
                  .select();

                if (customerInsertError) {
                  console.error('Failed to create customer record:', customerInsertError);
                  console.error('Customer data attempted:', customerData);
                } else {
                  console.log('Customer record created successfully:', insertedCustomer);
                }
              } else if (customer) {
                console.log('Customer record already exists');
              } else if (customerError) {
                console.error('Error checking customer:', customerError);
              }
            } catch (customerCheckError) {
              console.error('Exception checking/creating customer record:', customerCheckError);
            }
          } else {
            console.warn('User email is missing, cannot create customer record');
          }
        } catch (profileCheckError) {
          console.error('Exception checking/creating user profile:', profileCheckError);
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

