'use client';

import { X } from 'lucide-react';
import { Select } from '@/components/ui';

// Multi-select for niches built on the single-select dropdown: pick from the
// dropdown to add, selected niches show as removable chips.
//   options: [{ slug, name }]   value: string[] (slugs)   onChange(slugs)
export default function NicheSelect({ options = [], value = [], onChange, placeholder = 'Add a niche…' }) {
  const selected = new Set(value);
  const available = options
    .filter((o) => !selected.has(o.slug))
    .map((o) => ({ value: o.slug, label: o.name }));
  const nameForSlug = Object.fromEntries(options.map((o) => [o.slug, o.name]));

  function add(slug) {
    if (!slug || selected.has(slug)) return;
    onChange([...value, slug]);
  }
  function remove(slug) {
    onChange(value.filter((s) => s !== slug));
  }

  return (
    <div>
      <Select
        value=""
        onChange={add}
        options={available}
        placeholder={available.length ? placeholder : 'All niches selected'}
      />
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-sm font-medium text-brand-700"
            >
              {nameForSlug[slug] ?? slug}
              <button
                type="button"
                onClick={() => remove(slug)}
                aria-label={`Remove ${nameForSlug[slug] ?? slug}`}
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
