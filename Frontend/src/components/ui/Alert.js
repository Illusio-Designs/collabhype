import clsx from 'clsx';

const VARIANTS = {
  info: {
    box: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: 'text-sky-500',
  },
  success: {
    box: 'border-green-200 bg-green-50 text-green-900',
    icon: 'text-green-500',
  },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: 'text-amber-500',
  },
  danger: {
    box: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-500',
  },
};

const ICONS = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 011-1h.01a1 1 0 011 1v4a1 1 0 11-2 0V9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M8.485 2.495a1.75 1.75 0 013.03 0l6.28 10.875A1.75 1.75 0 0116.28 16H3.72a1.75 1.75 0 01-1.515-2.63L8.485 2.495zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm1 6a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export default function Alert({ variant = 'info', title, children, onClose, icon, className }) {
  const v = VARIANTS[variant];
  return (
    <div className={clsx('rounded-lg border p-4', v.box, className)} role="alert">
      <div className="flex items-start gap-3">
        <div className={clsx('mt-0.5 flex-shrink-0', v.icon)}>{icon ?? ICONS[variant]}</div>
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
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
