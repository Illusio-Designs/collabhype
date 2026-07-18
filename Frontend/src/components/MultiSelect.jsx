'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Select } from '@/components/ui';

// Multi-select built on the single-select dropdown: pick from the dropdown to
// add, selected values show as removable chips.
//   options: [{ value, label }]   value: string[]   onChange(values)
// Optional onCreate(name) -> Promise: lets the user add an item not in the list
// (e.g. a custom niche). It should create the item and return its value, which
// is then added to the selection.
export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  onCreate,
  placeholder = 'Add…',
  allSelectedLabel = 'All selected',
  createPlaceholder = 'Add your own…',
}) {
  const [custom, setCustom] = useState('');
  const [creating, setCreating] = useState(false);
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

  async function createCustom() {
    const name = custom.trim();
    if (!name || !onCreate) return;
    setCreating(true);
    try {
      const newValue = await onCreate(name);
      if (newValue && !selected.has(newValue)) onChange([...value, newValue]);
      setCustom('');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <Select
        value=""
        onChange={add}
        options={available}
        placeholder={available.length ? placeholder : allSelectedLabel}
      />

      {onCreate && (
        <div className="mt-2 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                createCustom();
              }
            }}
            placeholder={createPlaceholder}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={createCustom}
            disabled={creating || !custom.trim()}
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:border-brand-300 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

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
