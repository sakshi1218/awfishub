'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface TechnicalInfoItem {
  title: string;
  preview: string;
  details: { label: string; value: string }[];
}

interface TechnicalInfoDialogProps {
  item: TechnicalInfoItem;
  onClose: () => void;
}

export default function TechnicalInfoDialog({ item, onClose }: TechnicalInfoDialogProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="technical-info-dialog-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 id="technical-info-dialog-title" className="text-lg font-bold leading-7 text-slate-900 dark:text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{item.preview}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="mt-5 space-y-4">
          {item.details.map(({ label, value }) => (
            <section key={label}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-700 dark:text-violet-300">
                {label}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
