import { Suspense } from "react";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LoadsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Loads"
        description="Manage your freight loads and shipments"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Load
          </Button>
        }
      />
      
      <Suspense fallback={<div>Loading...</div>}>
        {/* Loads table, filters, etc. */}
        <div className="rounded-lg border p-6">
          {/* Table content goes here */}
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Load data would be displayed here
          </div>
        </div>
      </Suspense>
    </PageContainer>
  );
} 