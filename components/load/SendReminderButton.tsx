import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SendReminderButtonProps {
  loadId: string;
  teamMembers: TeamMember[];
  documentTypes: string[];
  onSuccess?: () => void;
}

export function SendReminderButton({
  loadId,
  teamMembers,
  documentTypes,
  onSuccess,
}: SendReminderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSendReminders = async () => {
    if (selectedRecipients.length === 0) {
      toast({
        title: 'No recipients selected',
        description: 'Please select at least one recipient',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders/send-missing-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loadId,
          documentTypes,
          recipients: selectedRecipients,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminders');
      }

      toast({
        title: 'Reminders sent',
        description: data.message,
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reminders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        Send Reminder
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Document Reminders</DialogTitle>
            <DialogDescription>
              Select team members to send reminders about missing documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Missing Documents</Label>
              <div className="flex flex-wrap gap-2">
                {documentTypes.map((type) => (
                  <span
                    key={type}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={selectedRecipients.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecipients([...selectedRecipients, member.id]);
                        } else {
                          setSelectedRecipients(
                            selectedRecipients.filter((id) => id !== member.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={member.id} className="text-sm">
                      {member.name} ({member.email}) - {member.role}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReminders}
              disabled={isLoading || selectedRecipients.length === 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reminders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 