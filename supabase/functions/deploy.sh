#!/bin/bash

# Load environment variables
source .env

# Deploy the email queue processor
supabase functions deploy process-email-queue \
  --project-ref $SUPABASE_PROJECT_ID \
  --no-verify-jwt \
  --env-file .env

# Set environment variables for the function
supabase secrets set \
  --project-ref $SUPABASE_PROJECT_ID \
  SUPABASE_URL=$SUPABASE_URL \
  SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  RESEND_API_KEY=$RESEND_API_KEY

echo "Edge Functions deployed successfully!" 