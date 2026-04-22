import React, { type ErrorInfo } from 'react';
import { logAppError } from '../services/errorLoggingService';

interface State {
  hasError: boolean;
  error: unknown;
}

export class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logAppError(error, 'react.error-boundary', {
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-fade-in" role="alert" aria-live="assertive">
            <h2 className="text-xl font-bold mb-2 text-red-400">Unerwarteter Fehler</h2>
            <p className="mb-4 text-zinc-200">Etwas ist schiefgelaufen. Bitte lade die Seite neu oder versuche es später erneut.</p>
            <button className="bg-[var(--color-accent-500)] text-white px-4 py-2 rounded" onClick={() => window.location.reload()}>Seite neu laden</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
