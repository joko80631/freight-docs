import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Template Preview - Freight Document Platform',
  description: 'Preview and test email templates for the Freight Document Platform',
};

export default function EmailPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
} 