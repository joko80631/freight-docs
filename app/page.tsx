'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  useEffect(() => {
    console.log('HomePage mounted');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Freight Document Platform
        </h1>
        <div className="mt-6 space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-md"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
} 