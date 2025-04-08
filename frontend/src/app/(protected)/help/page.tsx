"use client"

import { Mail, Clock, HelpCircle, FileText, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HelpPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Need help?</h1>
          <p className="text-lg text-muted-foreground">
            Our support team is here to assist you. Reach out directly, and we'll respond quickly.
          </p>
        </div>

        {/* Primary Support Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Email us directly for assistance with any questions or issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
              <a 
                href="mailto:support@hullgate.com" 
                className="text-2xl font-semibold text-primary hover:underline"
              >
                support@hullgate.com
              </a>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>We typically reply within 1 business day</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button asChild size="lg">
                <a href="mailto:support@hullgate.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Minimal FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Quick Help
            </CardTitle>
            <CardDescription>
              Common questions and solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-medium">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  How do I reset my password?
                </h3>
                <p className="pl-6 text-muted-foreground">
                  Email support at <a href="mailto:support@hullgate.com" className="text-primary hover:underline">support@hullgate.com</a> and we'll help you reset it quickly.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Having trouble uploading documents?
                </h3>
                <p className="pl-6 text-muted-foreground">
                  Ensure your files are in PDF format and under 20MB. Still stuck? Email support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 