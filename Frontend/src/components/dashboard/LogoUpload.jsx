'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImage, apiError } from '@/lib/apiClient';
import { useToast } from '@/components/ui';

const MAX_BYTES = 3 * 1024 * 1024; // must match the backend cap
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

// Image picker with live preview that uploads to the backend and hands the
// hosted URL back through onChange. `value` is the current logo URL (or '').
export default function LogoUpload({ value, onChange, folder = 'brand-logos' }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.push({ variant: 'danger', title: 'Not an image', body: 'Pick a PNG, JPG, WEBP or GIF.' });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.push({ variant: 'danger', title: 'Too large', body: 'Logo must be under 3 MB.' });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange?.(url);
      toast.push({ variant: 'success', title: 'Logo uploaded' });
    } catch (e) {
      toast.push({ variant: 'danger', title: 'Upload failed', body: apiError(e) });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Brand logo" className="h-full w-full object-contain" />
        ) : (
          <ImagePlus className="h-6 w-6 text-zinc-400" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-brand-300 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                {value ? 'Change logo' : 'Upload logo'}
              </>
            )}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange?.('')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-zinc-500 transition hover:text-red-600"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">PNG, JPG, WEBP or GIF · up to 3 MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="sr-only"
        />
      </div>
    </div>
  );
}
