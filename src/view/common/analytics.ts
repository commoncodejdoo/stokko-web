/**
 * PostHog wrapper — minimal, no-op-if-not-configured.
 *
 * The same PostHog project key is used by stokko-web and stokko-mobile.
 * We register an `app` super-property on init so dashboards can break down
 * by platform without ambiguity (built-in `$lib` already disambiguates
 * `posthog-js` from `posthog-react-native`).
 *
 * Loads `posthog-js` dynamically only when a key is present, so prod
 * builds without analytics stay light.
 */
import { Organization } from '@/domain/auth/user.domain';
import type { User } from '@/domain/auth/user.domain';

type PostHogInstance = {
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  capture(event: string, properties?: Record<string, unknown>): void;
  reset(): void;
  register(props: Record<string, unknown>): void;
};

let posthog: PostHogInstance | null = null;
let pending: Promise<void> | null = null;

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';

export function setupAnalytics(): void {
  if (!KEY || pending || posthog) return;
  pending = import('posthog-js')
    .then((mod) => {
      const ph = mod.default;
      ph.init(KEY, {
        api_host: HOST,
        capture_pageview: true,
        autocapture: true,
        // mask all input values in session recording for PII safety
        session_recording: { maskAllInputs: true },
      });
      ph.register({ app: 'stokko-web' });
      posthog = ph as unknown as PostHogInstance;
    })
    .catch((err) => {
      // analytics failure must not break the app
      // eslint-disable-next-line no-console
      console.warn('PostHog init failed', err);
    });
}

export const analytics = {
  identify(user: User, organization: Organization): void {
    posthog?.identify(user.id, {
      role: user.role,
      org_id: organization.id,
      org_name: organization.name,
    });
  },
  capture(event: string, properties?: Record<string, unknown>): void {
    posthog?.capture(event, properties);
  },
  reset(): void {
    posthog?.reset();
  },
};
