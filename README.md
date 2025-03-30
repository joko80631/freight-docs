# Freight Management System

A modern web application for managing freight documents and loads.

## Project Structure

```
freight/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js pages and API routes
│   │   │   └── ui/        # UI components
│   │   └── tests/         # Frontend tests
│   └── public/            # Static assets
├── backend/                # Backend services
│   └── src/
│       ├── middleware/    # Backend middleware
│       └── utils/         # Utility functions
└── uploads/               # Temporary file upload directory
```

## Data Model

### Loads
- Represents a freight shipment
- Contains basic information like origin, destination, and status
- Can have multiple documents associated with it

### Documents
- Associated with a specific load
- Stored in Supabase storage
- Contains metadata like:
  - Original filename
  - File type
  - File size
  - Upload timestamp
  - Uploaded by (user ID)
  - Classification status

### Users
- Can create and manage loads
- Can upload and manage documents
- Authentication handled by Supabase Auth

## Key Features

- Document upload with drag-and-drop support
- Automatic document classification
- Real-time status updates
- Secure file storage
- User authentication and authorization

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in required values

3. Start development server:
   ```bash
   npm run dev
   ```

## Testing

- Frontend tests: `npm run test`
- Backend tests: `npm run test:backend`

## Deployment

The application is configured for deployment on Vercel and Render. 