import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormControlProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormControl({ label, error, children, className }: FormControlProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 