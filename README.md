# Freight Document Platform

A modern web application for managing freight documents and logistics operations.

## Features

- Document Management
  - Upload and organize freight documents
  - Automatic document type detection
  - Version control and history tracking
  - Secure storage and access control

- Email Notifications
  - Automated document upload notifications
  - Missing document reminders
  - Customizable email templates
  - Unsubscribe functionality
  - Rate limiting and deduplication

- User Management
  - Role-based access control
  - Team collaboration
  - Email preferences
  - Audit logging

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Email**: Resend
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Database**: PostgreSQL (via Supabase)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freight.git
   cd freight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `RESEND_API_KEY`: Your Resend API key
- `NEXT_PUBLIC_APP_URL`: Your application URL

## Project Structure

```
freight/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Dashboard pages
├── components/            # React components
├── lib/                   # Utility functions and libraries
│   ├── email/            # Email system
│   ├── supabase/         # Supabase client
│   └── utils/            # Utility functions
├── public/               # Static files
└── styles/              # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 