import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardSection({ title, children, className }: DashboardSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h2>
      {children}
    </section>
  );
} 