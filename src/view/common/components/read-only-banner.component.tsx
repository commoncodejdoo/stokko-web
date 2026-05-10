import { useEffect, useState } from 'react';
import { useAuthStore } from '@/view/common/store/auth-store';

/**
 * A3 — yellow strip shown when the session was opened via a platform-admin
 * impersonation token. Includes a live countdown to expiry and a button to
 * abandon the session (returns the user to the login screen).
 */
export function ReadOnlyBanner() {
  const readOnly = useAuthStore((s) => s.readOnly);
  const expiresAt = useAuthStore((s) => s.readOnlyExpiresAt);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!readOnly || !expiresAt) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [readOnly, expiresAt]);

  if (!readOnly) return null;

  const remainingMs = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
      <div className="flex items-center gap-2">
        <span className="rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
          Read-only
        </span>
        <span>Admin pregled — izmjene su onemogućene.</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {expiresAt && (
          <span className="font-mono">
            ističe za {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        )}
        <button
          onClick={clearSession}
          className="rounded border border-amber-400 px-2 py-0.5 text-xs font-medium hover:bg-amber-200"
        >
          Zatvori sesiju
        </button>
      </div>
    </div>
  );
}
