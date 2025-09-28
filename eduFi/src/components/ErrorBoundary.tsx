"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: error?.message, stack: error?.stack, info }),
      });
    } catch {}
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white text-black dark:bg-black dark:text-white p-6">
          <div className="max-w-md w-full space-y-3 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary-500/40 border-t-primary-500 animate-spin" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">We hit a snag rendering the UI. You can retry or refresh the page.</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={this.handleRetry} className="px-4 py-2 rounded-md bg-primary-500 text-black hover:bg-primary-400">Retry</button>
              <button onClick={() => location.reload()} className="px-4 py-2 rounded-md border border-neutral-700">Refresh</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


