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
      // Ensure customer record exists for OAuth signups
      try {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', data.user.email!)
          .single();

        if (!existingCustomer) {
          // Create customer record if it doesn't exist
          await supabase
            .from('customers')
            .insert({
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            });
        }
      } catch (err) {
        console.error('Error ensuring customer record for OAuth:', err);
        // Don't fail the redirect if customer creation fails
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

