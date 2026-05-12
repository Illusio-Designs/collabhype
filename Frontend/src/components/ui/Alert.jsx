import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const VARIANTS = {
  info: {
    box: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: 'text-sky-500',
    Icon: Info,
  },
  success: {
    box: 'border-green-200 bg-green-50 text-green-900',
    icon: 'text-green-500',
    Icon: CheckCircle2,
  },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: 'text-amber-500',
    Icon: AlertTriangle,
  },
  danger: {
    box: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-500',
    Icon: XCircle,
  },
};

export default function Alert({ variant = 'info', title, children, onClose, icon, className }) {
  const v = VARIANTS[variant];
  const VariantIcon = v.Icon;
  return (
    <div className={clsx('rounded-lg border p-4', v.box, className)} role="alert">
      <div className="flex items-start gap-3">
        <div className={clsx('mt-0.5 flex-shrink-0', v.icon)}>
          {icon ?? <VariantIcon className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {children && (
            <div className={clsx('text-sm', title && 'mt-1 opacity-90')}>{children}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-60 transition hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
