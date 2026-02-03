
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
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
        <div className="p-8 max-w-2xl mx-auto mt-10 border border-red-200 bg-red-50 rounded-lg">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Wystąpił błąd</h1>
          <p className="text-red-700 mb-4">Aplikacja uległa awarii z następującym błędem:</p>
          <pre className="bg-white p-4 rounded border text-sm overflow-auto text-red-900">
            {this.state.error?.toString()}
             <br/>
             {this.state.error?.stack}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Odśwież stronę
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
