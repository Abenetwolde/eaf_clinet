import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 m-4 max-w-2xl mx-auto shadow-sm text-left">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-rose-950">
                {this.props.fallbackTitle || "Something went wrong loading this view"}
              </h3>
              <p className="text-xs text-rose-800 mt-1">
                {this.state.error?.message || "An unexpected rendering error occurred."}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-900 text-xs font-bold rounded-lg transition"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

