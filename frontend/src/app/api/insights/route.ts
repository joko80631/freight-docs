import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { generatePrompt } from '@/lib/ai/generatePrompt';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory rate limiter
// In production, consider using Redis or another persistent store
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Check rate limit
    const now = Date.now();
    const userRateLimit = rateLimiter.get(ip);
    
    if (userRateLimit) {
      // Reset counter if the time window has passed
      if (now > userRateLimit.resetTime) {
        rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
      } else if (userRateLimit.count >= RATE_LIMIT) {
        // Rate limit exceeded
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        // Increment counter
        userRateLimit.count += 1;
      }
    } else {
      // First request from this IP
      rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    }
    
    // Get team ID from request body
    const { teamId } = await request.json();
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch metrics data for the team
    const { data: metricsData, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch metrics data' },
        { status: 500 }
      );
    }
    
    // Fetch recent activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch activities data' },
        { status: 500 }
      );
    }
    
    // Prepare data for OpenAI
    const metrics = metricsData && metricsData.length > 0 ? metricsData[0] : null;
    const activities = activitiesData || [];
    
    // Generate prompt for OpenAI
    const prompt = generatePrompt(metrics, activities);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a freight logistics expert AI assistant. Provide concise, actionable insights based on the data provided. Focus on trends, potential issues, and opportunities for improvement. Keep your response under 150 words."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    
    // Extract insight from OpenAI response
    const insight = completion.choices[0]?.message?.content || "Unable to generate insights at this time.";
    
    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

// Helper function to generate prompt for OpenAI
function generatePrompt(metrics: any, activities: any[]) {
  let prompt = "Based on the following freight logistics data, provide insights:\n\n";
  
  if (metrics) {
    prompt += "Metrics:\n";
    prompt += `- Total Loads: ${metrics.total_loads} (${metrics.loads_trend > 0 ? '+' : ''}${metrics.loads_trend}% vs last month)\n`;
    prompt += `- Active Carriers: ${metrics.active_carriers} (${metrics.carriers_trend > 0 ? '+' : ''}${metrics.carriers_trend}% vs last month)\n`;
    prompt += `- On-Time Delivery: ${metrics.on_time_delivery}% (${metrics.delivery_trend > 0 ? '+' : ''}${metrics.delivery_trend}% vs last month)\n`;
    prompt += `- Revenue: $${(metrics.revenue / 1000).toFixed(1)}K (${metrics.revenue_trend > 0 ? '+' : ''}${metrics.revenue_trend}% vs last month)\n\n`;
  } else {
    prompt += "No metrics data available.\n\n";
  }
  
  if (activities && activities.length > 0) {
    prompt += "Recent Activities:\n";
    activities.forEach((activity, index) => {
      prompt += `${index + 1}. ${activity.title}: ${activity.description} (${activity.type})\n`;
    });
  } else {
    prompt += "No recent activities available.\n";
  }
  
  return prompt;
} 