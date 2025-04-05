/**
 * Generates a prompt for OpenAI based on metrics and activities data
 * @param metrics - The metrics data from Supabase
 * @param activities - The activities data from Supabase
 * @returns A formatted prompt string for OpenAI
 */
export function generatePrompt(metrics: any, activities: any[]): string {
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