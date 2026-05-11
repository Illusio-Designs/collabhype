import clsx from 'clsx';

export default function Divider({ children, className }) {
  if (children) {
    return (
      <div className={clsx('relative my-6', className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
            {children}
          </span>
        </div>
      </div>
    );
  }
  return <hr className={clsx('border-zinc-200', className)} />;
}
