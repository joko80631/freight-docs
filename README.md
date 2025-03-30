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

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freight.git
   cd freight
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your values

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