# Freight Document Tracking System

A modern web application for tracking freight documents and managing load information.

## Features

- User authentication with Supabase
- Load management and tracking
- Document upload and classification
- Real-time status updates
- Responsive UI with Tailwind CSS

## Tech Stack

- Frontend: Next.js 14, React 18, Tailwind CSS
- Backend: Node.js, Express
- Database: Supabase
- Authentication: Supabase Auth
- File Storage: Supabase Storage

## Project Structure

```
freight/
├── backend/
│   ├── server.js          # Express server
│   ├── uploads/           # File upload directory
│   └── tests/            # Backend test files
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   │   └── shared/   # Shared UI components
│   │   └── tests/       # Frontend test files
│   └── package.json
└── README.md
```

## Environment Setup

### Frontend Environment Variables

1. Copy `frontend/.env.example` to `frontend/.env.local`:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Update the following variables in `frontend/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_SITE_URL`: Your frontend URL
   - `NEXT_PUBLIC_SITE_NAME`: Your site name
   - Feature flags as needed

### Backend Environment Variables

1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update the following variables in `backend/.env`:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: Backend server port (default: 3001)
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
   - `MAX_FILE_SIZE`: Maximum file upload size in bytes
   - `UPLOAD_DIR`: Directory for file uploads

### Development vs Production

- For local development, use the `.env.local` and `.env` files
- For testing, use `.env.test` in the frontend
- For production, set environment variables in your hosting platform (Vercel/Render)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freight.git
   cd freight
   ```

2. Set up environment variables as described above

3. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

4. Start development servers:
   ```bash
   # Frontend (in frontend directory)
   npm run dev

   # Backend (in backend directory)
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Development

- Frontend runs on port 3000
- Backend API runs on port 3001
- Use `npm run lint` to check code style
- Use `npm run test` to run tests

## Deployment

The application is deployed on Vercel:
- Frontend: https://freight-docs-ten.vercel.app
- Backend: [Your backend URL]

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 