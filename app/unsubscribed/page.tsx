import React from 'react';
import Link from 'next/link';

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Successfully Unsubscribed
        </h1>
        
        <p className="text-gray-600 mb-6">
          You have been successfully unsubscribed from these notifications.
          You can manage your email preferences at any time from your account settings.
        </p>

        <div className="space-y-4">
          <Link
            href="/settings/notifications"
            className="block w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Manage Email Preferences
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 