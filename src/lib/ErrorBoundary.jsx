import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Surface unexpected render errors gracefully in production.
    // Optionally report to a logging service here.
    if (import.meta.env?.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-7xl font-light text-border">500</h1>
              <div className="h-0.5 w-16 bg-primary/30 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-medium text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground leading-relaxed">
              An unexpected error occurred. Please try reloading the page, or come back in a moment.
            </p>
            <div className="pt-4">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}