import clsx from 'clsx';

export default function Stat({ label, value, change, prefix, suffix, icon, className }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
            {label}
          </div>
          <div className="mt-2 truncate text-xl font-bold text-zinc-900 sm:text-2xl lg:text-3xl">
            {prefix}
            {value}
            {suffix}
          </div>
          {change != null && (
            <div
              className={clsx(
                'mt-1 inline-flex flex-wrap items-center gap-1 text-[11px] font-medium sm:text-xs',
                change >= 0 ? 'text-green-600' : 'text-red-600',
              )}
            >
              <span>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="hidden text-zinc-400 sm:inline">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
