import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6 text-sm">
              We encountered an unexpected error. Please try reloading the page.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-gray-600">
               {this.state.error?.message || "Unknown Error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
