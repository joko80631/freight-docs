import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-secret');
const ISSUER = 'freight-document-platform';
const AUDIENCE = 'email-recipients';

interface UnsubscribeTokenPayload {
  sub: string; // user ID or email
  scope: string; // notification type or 'all'
  exp?: number;
}

export async function generateUnsubscribeToken(
  userId: string,
  scope: string = 'all',
  expiresIn: string = '1y'
): Promise<string> {
  const token = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(userId)
    .setExpirationTime(expiresIn)
    .sign(SECRET);

  return token;
}

export async function verifyUnsubscribeToken(token: string): Promise<UnsubscribeTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    // Validate required properties
    if (!payload.sub || !payload.scope) {
      console.error('Invalid token payload:', payload);
      return null;
    }

    return {
      sub: payload.sub,
      scope: payload.scope as string,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('Error verifying unsubscribe token:', error);
    return null;
  }
}

export async function unsubscribeUser(token: string): Promise<boolean> {
  const payload = await verifyUnsubscribeToken(token);
  if (!payload) return false;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: payload.sub,
        scope: payload.scope,
        opted_out: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating email preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in unsubscribeUser:', error);
    return false;
  }
} 