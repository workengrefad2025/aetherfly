import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an exception:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f5f1] dark:bg-[#121211] px-4 py-12 text-center">
          <div className="max-w-xl rounded-3xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-slate-950 p-10 shadow-2xl">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-4">Something went wrong.</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              We&rsquo;re sorry, but an unexpected issue occurred while loading the page. Please refresh or try again later.
            </p>
            <button
              onClick={this.reset}
              className="inline-flex items-center justify-center rounded-full bg-[#D4A24C] px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#E0B15A]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
