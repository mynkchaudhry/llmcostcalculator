'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="max-w-lg mx-auto text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;re sorry, but something unexpected happened. This error has been logged and we&apos;re working to fix it.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-400 mb-2">Error Details:</h3>
                <code className="text-xs text-red-300 block whitespace-pre-wrap">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;