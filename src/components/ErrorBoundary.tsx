import { Component, type ReactNode, type ErrorInfo } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-elevated dark:border-red-900/30 dark:bg-zinc-900"
          >
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-zinc-100">
              Bir şeyler ters gitti
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-zinc-400">
              Uygulama beklenmedik bir hata ile karşılaştı. Lütfen tekrar deneyin.
            </p>

            {this.state.error && (
              <pre className="mb-6 max-h-24 overflow-auto rounded-xl bg-gray-50 p-3 text-left text-xs text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleRetry}
              className="rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 active:scale-[0.97]"
            >
              Tekrar Dene
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
