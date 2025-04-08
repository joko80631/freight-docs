import { CreateTeamDialog } from '@/components/team/CreateTeamDialog';

export default function NewTeamPage() {
  return (
    <div className="container py-6">
      <CreateTeamDialog open={true} onOpenChange={() => {}} />
    </div>
  );
} 