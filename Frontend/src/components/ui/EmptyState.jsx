import clsx from 'clsx';

export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-white text-zinc-400 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
