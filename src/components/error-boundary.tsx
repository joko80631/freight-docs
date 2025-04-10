'use client';

import React from 'react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent: React.ComponentType<FallbackProps>;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <this.props.FallbackComponent
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
} 