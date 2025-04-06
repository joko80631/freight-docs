import { serve } from "http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { QueueMessageStatus } from "../../../lib/queue/types";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>;
  subject: string;
  content: string;
  from?: string;
  cc?: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>;
  bcc?: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

interface ErrorWithDetails {
  name: string;
  message: string;
  details?: unknown;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Resend client
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Dequeue a message
    const { data: message, error: dequeueError } = await supabaseClient
      .rpc('dequeue_message', {
        p_max_attempts: 3,
        p_visibility_timeout: 300,
      });

    if (dequeueError) throw dequeueError;
    if (!message) {
      return new Response(
        JSON.stringify({ message: 'No messages to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Send email using Resend
      const payload = message.payload as EmailPayload;
      const result = await resend.emails.send({
        from: payload.from || 'noreply@freightplatform.com',
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        subject: payload.subject,
        html: payload.content,
        reply_to: payload.replyTo?.email,
        attachments: payload.attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        })),
      });

      // Mark message as completed
      await supabaseClient
        .from('email_queue')
        .update({
          status: QueueMessageStatus.COMPLETED,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      return new Response(
        JSON.stringify({ message: 'Email sent successfully', messageId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // Handle email sending error
      const errorDetails: ErrorWithDetails = {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error,
      };

      // Update message status
      await supabaseClient
        .from('email_queue')
        .update({
          status: QueueMessageStatus.FAILED,
          error: errorDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 