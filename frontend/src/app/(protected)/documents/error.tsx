'use client';

import { PageError } from '@/components/ui/PageError';

export default function Error({ error }: { error: Error }) {
  return <PageError message={error.message} />;
} 