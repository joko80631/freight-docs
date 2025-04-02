'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Upload, UserPlus } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button asChild size="lg" className="flex items-center gap-2">
        <Link href="/loads/new">
          <Plus className="h-4 w-4" />
          Create Load
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="flex items-center gap-2">
        <Link href="/documents/upload">
          <Upload className="h-4 w-4" />
          Upload Document
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="flex items-center gap-2">
        <Link href="/teams/invite">
          <UserPlus className="h-4 w-4" />
          Invite Teammate
        </Link>
      </Button>
    </div>
  );
} 