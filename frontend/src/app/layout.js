import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Freight Document System',
  description: 'Manage and track freight documents',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-primary min-h-screen`}>
        <nav className="border-b border-primary">
          <div className="max-w-container mx-auto px-4">
            <div className="flex items-center h-16 space-x-8">
              <Link 
                href="/" 
                className="text-lg font-semibold hover:text-gray-600 transition-colors"
              >
                Freight Docs
              </Link>
              <div className="flex space-x-6">
                <Link 
                  href="/" 
                  className="text-sm hover:text-gray-600 transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/upload" 
                  className="text-sm hover:text-gray-600 transition-colors"
                >
                  Upload
                </Link>
                <Link 
                  href="/loads/new" 
                  className="text-sm hover:text-gray-600 transition-colors"
                >
                  New Load
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
} 