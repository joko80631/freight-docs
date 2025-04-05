# Dashboard Implementation

This dashboard is built using Next.js, Supabase, and OpenAI to provide a modern, data-driven interface for freight management.

## Features

- **Real-time Metrics**: Displays key performance indicators for freight operations
- **Recent Activity Timeline**: Shows the latest updates from shipments and team actions
- **AI-Powered Insights**: Provides intelligent analysis of freight operations using OpenAI
- **Quick Actions**: Allows users to quickly navigate to key functions

## Data Flow

1. **User Authentication**: Handled by Supabase Auth
2. **Data Fetching**: Metrics and activities are fetched from Supabase tables
3. **AI Insights**: Data is sent to OpenAI API for analysis
4. **UI Rendering**: Data is displayed using shadcn/ui components

## Database Schema

### Metrics Table
- `id`: UUID (Primary Key)
- `team_id`: UUID (Foreign Key to teams)
- `total_loads`: Integer
- `loads_trend`: Decimal
- `active_carriers`: Integer
- `carriers_trend`: Decimal
- `on_time_delivery`: Decimal
- `delivery_trend`: Decimal
- `revenue`: Decimal
- `revenue_trend`: Decimal
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Activities Table
- `id`: UUID (Primary Key)
- `team_id`: UUID (Foreign Key to teams)
- `title`: Text
- `description`: Text
- `type`: Text (success, warning, error, info)
- `created_at`: Timestamp

## API Routes

### `/api/insights`
- **Method**: POST
- **Purpose**: Fetches data from Supabase and sends it to OpenAI for analysis
- **Request Body**: `{ teamId: string }`
- **Response**: `{ insight: string }`

#### Example Request

```bash
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d '{"teamId":"your-team-id"}'
```

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## Setup Instructions

1. Run the Supabase migration to create the necessary tables:
   ```
   supabase db push
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Set up the environment variables in your `.env.local` file

4. Start the development server:
   ```
   npm run dev
   ```

## Customization

- **Metrics**: Modify the metrics section in `page.tsx` to display different KPIs
- **Activities**: Update the activities query to show different types of events
- **AI Insights**: Adjust the prompt in `route.ts` to focus on specific aspects of the data
- **UI**: Customize the shadcn/ui components to match your brand

## Troubleshooting

- **Data not loading**: Check Supabase connection and RLS policies
- **AI insights not working**: Verify OpenAI API key and quota
- **UI issues**: Ensure all shadcn/ui components are properly installed 