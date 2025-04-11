import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { routes } from '@/config/routes';
import { useRouter } from 'next/navigation';

// ... rest of imports ...

export default function DashboardPage() {
  const router = useRouter();

  const uploadButton = (
    <Button onClick={() => router.push(routes.documents.upload)}>
      <Plus className="mr-2 h-4 w-4" />
      Upload Document
    </Button>
  );

  return (
    <div>
      {uploadButton}
      {/* Rest of the dashboard content */}
    </div>
  );
} 