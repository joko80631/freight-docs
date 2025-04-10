import { routes } from '@/config/routes';

// ... rest of imports ...

// Update any hardcoded routes to use the routes object
const uploadButton = (
  <Button onClick={() => router.push(routes.documentUpload)}>
    <Plus className="mr-2 h-4 w-4" />
    Upload Document
  </Button>
); 