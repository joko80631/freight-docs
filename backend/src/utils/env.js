/**
 * Required environment variables and their descriptions
 */
const requiredEnvVars = {
  SUPABASE_URL: 'Supabase project URL',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key',
  OPENAI_API_KEY: 'OpenAI API key for document classification'
};

/**
 * Validate required environment variables
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnv() {
  const missingVars = [];

  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missingVars.push(`${key} (${description})`);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}`
    );
  }

  // Validate Supabase URL format
  if (!process.env.SUPABASE_URL.startsWith('https://')) {
    throw new Error('SUPABASE_URL must start with https://');
  }

  // Validate OpenAI API key format
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }

  console.log('Environment validation passed');
} 