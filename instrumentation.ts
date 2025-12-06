import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Only load Sentry configs if Sentry is enabled
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true") {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  }
}

// Only export Sentry error handler if Sentry is enabled
export const onRequestError = process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true" 
  ? Sentry.captureRequestError 
  : undefined;
