'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-lg text-center space-y-4">
          <h2 className="text-base font-bold">AWFIS HUB — Application Recovery</h2>
          <p className="text-xs text-slate-500">
            {error.message || 'A root layout error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
