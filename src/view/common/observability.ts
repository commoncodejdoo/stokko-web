/**
 * Sentry wrapper — placeholder.
 *
 * Implementation deferred until the team is ready to enable Sentry in
 * production. To activate:
 *
 *   1. Add `@sentry/react` to `package.json`.
 *   2. Replace this body with:
 *
 *      import * as Sentry from '@sentry/react';
 *      const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
 *      export function setupObservability(): void {
 *        if (!DSN || !import.meta.env.PROD) return;
 *        Sentry.init({
 *          dsn: DSN,
 *          environment: import.meta.env.MODE,
 *          tracesSampleRate: 0.2,
 *          integrations: [Sentry.browserTracingIntegration()],
 *        });
 *      }
 *
 *   3. Add `@sentry/vite-plugin` for production source-maps upload.
 */

export function setupObservability(): void {
  // intentionally empty — see comment above
}
