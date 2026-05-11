import clsx from 'clsx';

export default function Stat({ label, value, change, prefix, suffix, icon, className }) {
  return (
    <div className={clsx('rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900">
            {prefix}
            {value}
            {suffix}
          </div>
          {change != null && (
            <div
              className={clsx(
                'mt-1 inline-flex items-center gap-1 text-xs font-medium',
                change >= 0 ? 'text-green-600' : 'text-red-600',
              )}
            >
              <span>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-zinc-400">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
