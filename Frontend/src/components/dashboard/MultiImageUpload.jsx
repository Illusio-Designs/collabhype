'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImage, apiError } from '@/lib/apiClient';
import { useToast } from '@/components/ui';

const MAX_BYTES = 3 * 1024 * 1024;

// Upload several images; `value` is an array of hosted URLs, onChange(urls).
export default function MultiImageUpload({ value = [], onChange, folder = 'briefs', max = 8 }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files) {
    const list = Array.from(files || []).slice(0, max - value.length);
    if (!list.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const file of list) {
        if (!file.type.startsWith('image/') || file.size > MAX_BYTES) continue;
        urls.push(await uploadImage(file, folder));
      }
      if (urls.length) onChange?.([...value, ...urls]);
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Upload failed', body: apiError(e) });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange?.(value.filter((u) => u !== url))}
              className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-zinc-300 text-zinc-400 transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />
    </div>
  );
}
