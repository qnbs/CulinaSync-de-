import React, { type ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { logAppError } from '../services/errorLoggingService';
import { Button, Card } from './ui';

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
      return <ErrorFallback onReload={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ onReload: () => void }> = ({ onReload }) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center glass-overlay p-4"
      role="alert"
      aria-live="assertive"
    >
      <Card variant="card" className="glass-modal max-w-md w-full text-center page-fade-in" padding="lg">
        <h2 className="text-xl font-bold mb-2 text-red-400">{t('app.globalErrorBoundary.title')}</h2>
        <p className="mb-6 text-zinc-300 leading-relaxed">{t('app.globalErrorBoundary.description')}</p>
        <Button type="button" onClick={onReload} fullWidth>
          {t('app.globalErrorBoundary.reload')}
        </Button>
      </Card>
    </div>
  );
};
