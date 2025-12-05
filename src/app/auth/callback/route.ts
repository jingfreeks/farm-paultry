import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Ensure user_profile and customer records are created (fallback if trigger fails)
      try {
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
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || null,
              role: 'customer',
              is_active: true,
            });

          if (insertError) {
            console.warn('Failed to create user profile in callback:', insertError);
          }
        }

        // Also ensure customer record exists
        if (data.user.email) {
          try {
            const { data: customer, error: customerError } = await supabase
              .from('customers')
              .select('id')
              .eq('email', data.user.email)
              .single();

            if (customerError && customerError.code === 'PGRST116') {
              const customerData: any = {
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || null,
              };

              // Add user_profile_id if we have a profile
              if (profile || !profileError) {
                customerData.user_profile_id = data.user.id;
              }

              const { error: customerInsertError } = await supabase
                .from('customers')
                .insert(customerData);

              if (customerInsertError) {
                console.warn('Failed to create customer record in callback:', customerInsertError);
              }
            }
          } catch (customerCheckError) {
            console.warn('Error checking/creating customer record in callback:', customerCheckError);
          }
        }
      } catch (profileCheckError) {
        console.warn('Error checking/creating user profile in callback:', profileCheckError);
        // Don't fail the redirect if profile check fails
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

