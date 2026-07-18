'use client';

import { X } from 'lucide-react';
import { Select } from '@/components/ui';

// Multi-select built on the single-select dropdown: pick from the dropdown to
// add, selected values show as removable chips.
//   options: [{ value, label }]   value: string[]   onChange(values)
export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Add…',
  allSelectedLabel = 'All selected',
}) {
  const selected = new Set(value);
  const available = options.filter((o) => !selected.has(o.value));
  const labelFor = Object.fromEntries(options.map((o) => [o.value, o.label]));

  function add(v) {
    if (!v || selected.has(v)) return;
    onChange([...value, v]);
  }
  function remove(v) {
    onChange(value.filter((x) => x !== v));
  }

  return (
    <div>
      <Select
        value=""
        onChange={add}
        options={available}
        placeholder={available.length ? placeholder : allSelectedLabel}
      />
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-sm font-medium text-brand-700"
            >
              {labelFor[v] ?? v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label={`Remove ${labelFor[v] ?? v}`}
                className="grid h-4 w-4 place-items-center rounded-full text-brand-500 transition hover:bg-brand-100 hover:text-brand-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
