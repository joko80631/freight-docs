import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { validateUnsubscribeToken } from '@/lib/utils/unsubscribe-token';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unsubscribe token is required' }, { status: 400 });
    }

    // Validate the unsubscribe token
    const validationResult = validateUnsubscribeToken(token);
    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: validationResult.error || 'Invalid unsubscribe token',
        expired: validationResult.expired 
      }, { status: 400 });
    }

    const { email, scope } = validationResult;
    
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Update user preferences in the database
    if (scope === 'all') {
      // Unsubscribe from all emails
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          email,
          email_opt_in: false,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating user preferences:', updateError);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
      }
    } else {
      // Unsubscribe from specific category
      const { data: preferences, error: fetchError } = await supabase
        .from('user_preferences')
        .select('email_opt_in, email_categories')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user preferences:', fetchError);
        return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
      }

      // Initialize email categories if not exists
      const emailCategories = preferences?.email_categories || {};
      
      // Set the specific category to false
      emailCategories[scope] = false;
      
      // Check if all categories are false
      const allCategoriesOptedOut = Object.values(emailCategories).every(value => value === false);
      
      // Update preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          email,
          email_opt_in: !allCategoriesOptedOut, // Set to false if all categories are opted out
          email_categories: emailCategories,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating user preferences:', updateError);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      email,
      scope,
      message: scope === 'all' 
        ? 'You have been unsubscribed from all emails' 
        : `You have been unsubscribed from ${scope} emails`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 