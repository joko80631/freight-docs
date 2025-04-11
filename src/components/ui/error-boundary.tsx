"use client";

import React from "react";
import { Button } from "./button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { animationClasses } from "@/lib/animations";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
  FallbackComponent?: React.ComponentType<FallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.FallbackComponent) {
        return (
          <this.props.FallbackComponent
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      return (
        <div className={cn(
          "flex min-h-[400px] flex-col items-center justify-center space-y-6 p-6 text-center rounded-lg border border-destructive/20 bg-destructive/5",
          animationClasses.base,
          this.props.className
        )}>
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {this.state.error.message ||
                "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <Button
            variant="outline"
            className={cn(
              "gap-2",
              animationClasses.button.click
            )}
            onClick={this.resetErrorBoundary}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
} 