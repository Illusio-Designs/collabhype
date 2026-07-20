'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Route-level error boundary — replaces the raw "client-side exception" screen
// with a recoverable one and logs the real error to the console for debugging.
export default function Error({ error, reset }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app error]', error);
  }, [error]);

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-zinc-600">
          An unexpected error occurred. You can try again, or head back home.
        </p>
        {error?.digest && (
          <p className="mt-1 font-mono text-xs text-zinc-400">Ref: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-brand-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
