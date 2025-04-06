import { createHash, createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Secret key for signing tokens - should be stored in environment variables
const UNSUBSCRIBE_SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || 'default-secret-key-change-in-production';

/**
 * Generate a secure unsubscribe token for a user
 * @param userId User ID
 * @param email User's email address
 * @param category Optional category to unsubscribe from
 * @returns Unsubscribe token
 */
export function generateUnsubscribeToken(
  userId: string,
  email: string,
  category?: string
): string {
  // Create a payload with user info and expiration
  const payload = {
    userId,
    email,
    category,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days expiration
  };

  // Convert payload to base64
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');

  // Create signature
  const signature = createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(payloadBase64)
    .digest('hex');

  // Combine payload and signature
  return `${payloadBase64}.${signature}`;
}

/**
 * Validate an unsubscribe token
 * @param token Token to validate
 * @returns Decoded payload or null if invalid
 */
export function validateUnsubscribeToken(token: string): any {
  try {
    const [payloadBase64, signature] = token.split('.');

    // Verify signature
    const expectedSignature = createHmac('sha256', UNSUBSCRIBE_SECRET)
      .update(payloadBase64)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error validating unsubscribe token:', error);
    return null;
  }
}

/**
 * Process an unsubscribe request
 * @param token Unsubscribe token
 * @returns Success status and message
 */
export async function processUnsubscribe(token: string): Promise<{ success: boolean; message: string }> {
  const payload = validateUnsubscribeToken(token);
  
  if (!payload) {
    return { success: false, message: 'Invalid or expired unsubscribe link' };
  }

  try {
    const { userId, email, category } = payload;

    // Update user preferences in the database
    if (category) {
      // Unsubscribe from specific category
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: false,
          categories: {
            ...(await getUserCategories(userId)),
            [category]: false
          }
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Global unsubscribe
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: false
        })
        .eq('user_id', userId);

      if (error) throw error;
    }

    // Record unsubscribe event
    const { error: eventError } = await supabase
      .from('email_events')
      .insert({
        email_id: `unsubscribe-${userId}`,
        user_id: userId,
        event_type: 'unsubscribed',
        event_data: { category, email }
      });

    if (eventError) throw eventError;

    return { 
      success: true, 
      message: category 
        ? `You have been unsubscribed from ${category} emails` 
        : 'You have been unsubscribed from all emails' 
    };
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return { success: false, message: 'Failed to process unsubscribe request' };
  }
}

/**
 * Get user's current email categories
 * @param userId User ID
 * @returns User's email categories
 */
async function getUserCategories(userId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('categories')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user categories:', error);
    return {};
  }

  return data?.categories || {};
}

/**
 * Generate an unsubscribe URL
 * @param userId User ID
 * @param email User's email address
 * @param category Optional category to unsubscribe from
 * @returns Unsubscribe URL
 */
export function generateUnsubscribeUrl(
  userId: string,
  email: string,
  category?: string
): string {
  const token = generateUnsubscribeToken(userId, email, category);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
} 