import clsx from 'clsx';

export function FormField({ label, hint, error, required, children, className }) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

// Kept for backwards compatibility with auth pages
export function inputClasses() {
  return 'block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';
}
