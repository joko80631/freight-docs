import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { teamId } = await request.json();
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get metrics data
    const { data: metrics, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (metricsError) throw metricsError;

    // Generate a simple insight based on metrics
    let insight = "Welcome to your dashboard! ";
    
    if (metrics) {
      if (metrics.loads_trend > 0) {
        insight += `Your total loads have increased by ${metrics.loads_trend}% compared to last month. `;
      }
      
      if (metrics.on_time_delivery >= 95) {
        insight += "Your on-time delivery rate is excellent! ";
      } else if (metrics.on_time_delivery >= 85) {
        insight += "Your on-time delivery rate is good, but there's room for improvement. ";
      }
      
      if (metrics.revenue_trend > 0) {
        insight += `Revenue is trending up by ${metrics.revenue_trend}%. Keep up the great work!`;
      }
    } else {
      insight += "Start adding loads to see insights about your freight operations.";
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
} 