'use client';

import { useEffect, useRef, useState, cloneElement } from 'react';
import clsx from 'clsx';

// Click-triggered dropdown menu. Closes on outside click, Escape, or item click.
//
// Usage:
//   <Dropdown
//     trigger={<Button>Actions</Button>}
//     items={[
//       { label: 'Edit', icon: <EditIcon />, onClick: () => {} },
//       { label: 'Duplicate', onClick: () => {} },
//       { divider: true },
//       { label: 'Delete', danger: true, onClick: () => {} },
//     ]}
//   />

export default function Dropdown({
  trigger,
  items = [],
  align = 'left',
  width = 'w-56',
  className,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Forward an onClick to the trigger so any element can open the menu.
  const triggerNode = cloneElement(trigger, {
    onClick: (e) => {
      trigger.props.onClick?.(e);
      setOpen((v) => !v);
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <div ref={rootRef} className={clsx('relative inline-block', className)}>
      {triggerNode}
      {open && (
        <div
          role="menu"
          className={clsx(
            'absolute z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl shadow-zinc-900/5',
            width,
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={`d-${i}`} className="my-1 h-px bg-zinc-100" />;
            }
            if (item.header) {
              return (
                <div
                  key={`h-${i}`}
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400"
                >
                  {item.header}
                </div>
              );
            }
            const Tag = item.href ? 'a' : 'button';
            return (
              <Tag
                key={item.label + i}
                role="menuitem"
                type={item.href ? undefined : 'button'}
                href={item.href}
                disabled={item.disabled}
                onClick={(e) => {
                  if (item.disabled) return;
                  item.onClick?.(e);
                  setOpen(false);
                }}
                className={clsx(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition',
                  item.disabled
                    ? 'cursor-not-allowed text-zinc-400'
                    : item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                )}
              >
                {item.icon && (
                  <span
                    className={clsx(
                      'grid h-4 w-4 flex-shrink-0 place-items-center',
                      item.danger ? 'text-red-500' : 'text-zinc-500',
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-[10px] text-zinc-400">{item.shortcut}</span>
                )}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
}
