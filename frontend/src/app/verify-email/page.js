'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen py-8">
        <div className="w-full max-w-md p-6 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 