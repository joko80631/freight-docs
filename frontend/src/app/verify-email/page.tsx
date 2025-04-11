"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || type !== "email_verification") {
          toast.error("Error", {
            description: "Invalid verification link",
          });
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) throw error;

        toast.success("Email verified", {
          description: "Your email has been verified successfully. You can now log in.",
        });
        router.push("/login");
      } catch (error) {
        toast.error("Error", {
          description: "Failed to verify email. Please try again.",
        });
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: searchParams.get("email") ?? "",
      });

      if (error) throw error;

      toast.success("Email sent", {
        description: "Please check your email for the verification link.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to resend verification email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We've sent you a verification link. Please check your email and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you haven't received the email, check your spam folder or click the button below to resend.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 