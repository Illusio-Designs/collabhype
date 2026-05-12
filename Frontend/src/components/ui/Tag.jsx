import clsx from 'clsx';
import { X } from 'lucide-react';

const VARIANTS = {
  default: 'bg-zinc-100 text-zinc-700',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-green-50 text-green-700',
};

export default function Tag({ children, onClose, variant = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="grid h-3.5 w-3.5 place-items-center rounded opacity-50 hover:bg-black/10 hover:opacity-100"
          aria-label="Remove tag"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}
