'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Find detailed guides and documentation for using the platform.
            </p>
            <a 
              href="https://docs.example.com" 
              className="text-primary hover:underline mt-4 inline-block"
            >
              View Documentation →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Need help? Contact our support team for assistance.
            </p>
            <a 
              href="mailto:support@example.com" 
              className="text-primary hover:underline mt-4 inline-block"
            >
              Contact Support →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Find answers to commonly asked questions.
            </p>
            <a 
              href="/help/faq" 
              className="text-primary hover:underline mt-4 inline-block"
            >
              View FAQs →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Join our community forum to connect with other users.
            </p>
            <a 
              href="https://community.example.com" 
              className="text-primary hover:underline mt-4 inline-block"
            >
              Join Community →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 