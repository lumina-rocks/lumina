import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if this is a nostr-related error that we want to suppress
    if (ErrorBoundary.isNostrError(error)) {
      console.warn('Suppressed nostr error in ErrorBoundary:', error);
      return { hasError: false }; // Don't show error UI
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Check if this is a nostr-related error that we want to suppress
    if (ErrorBoundary.isNostrError(error)) {
      console.warn('Suppressed nostr error in ErrorBoundary:', error);
      return; // Don't log or handle the error
    }
    
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  static isNostrError(error: Error): boolean {
    const message = error.message || '';
    const stack = error.stack || '';
    
    return (
      message.includes('auth-required') ||
      message.includes('auth required') ||
      stack.includes('handleNext') ||
      stack.includes('index.js:544') ||
      stack.includes('nostr-tools')
    );
  }

  render() {
    if (this.state.hasError) {
      // Only show error UI for non-nostr errors
      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">An unexpected error occurred. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
