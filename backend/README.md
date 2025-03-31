# Freight Document Tracking Backend

This is the backend service for the Freight Document Tracking application. It provides APIs for managing loads and their associated documents.

## Features

- Load management (create, retrieve, update)
- Document tracking and status monitoring
- Authentication and authorization
- Supabase integration for data storage

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project
- JWT secret key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### Loads

- `POST /api/loads` - Create a new load
- `GET /api/loads/:id/status` - Get load status and missing documents

## Development

- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm start` - Start production server

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "error": "Error type",
  "details": "Detailed error message"
}
```

## Security

- JWT-based authentication
- CORS enabled
- Input validation using Zod
- Environment variable protection 