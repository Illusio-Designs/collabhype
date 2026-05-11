'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
  if (['mp4', 'mov', 'webm', 'avi'].includes(ext)) return '🎬';
  if (['pdf'].includes(ext)) return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
  return '📁';
}

export default function FileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  onChange,
  label = 'Drop files here or click to browse',
  hint,
  value,
  disabled = false,
  className,
}) {
  const inputRef = useRef(null);
  const [internal, setInternal] = useState([]);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState(null);

  const files = value !== undefined ? (Array.isArray(value) ? value : value ? [value] : []) : internal;

  function commit(next) {
    if (value === undefined) setInternal(next);
    onChange?.(multiple ? next : next[0] ?? null);
  }

  function handleFiles(list) {
    setError(null);
    const arr = Array.from(list);
    if (maxSize && arr.some((f) => f.size > maxSize)) {
      setError(`File too large (max ${formatBytes(maxSize)})`);
      return;
    }
    let next = multiple ? [...files, ...arr] : arr.slice(0, 1);
    if (maxFiles && next.length > maxFiles) {
      setError(`At most ${maxFiles} file${maxFiles === 1 ? '' : 's'}`);
      next = next.slice(0, maxFiles);
    }
    commit(next);
  }

  function remove(i) {
    commit(files.filter((_, idx) => idx !== i));
  }

  function clear() {
    commit([]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className={className}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={onDrop}
        className={clsx(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition',
          drag
            ? 'border-brand-600 bg-brand-50'
            : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          className="sr-only"
        />
        <motion.div
          animate={drag ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 4v12m0-12l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <div className="mt-3 text-sm font-medium text-zinc-900">{label}</div>
        {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
        {drag && (
          <div className="mt-2 text-xs font-semibold text-brand-700">Release to drop</div>
        )}
      </div>

      {error && (
        <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {files.map((f, i) => (
              <motion.div
                key={`${f.name}-${i}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm"
              >
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md bg-zinc-100 text-lg">
                  {fileIcon(f.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-900">{f.name}</div>
                  <div className="text-xs text-zinc-500">{formatBytes(f.size)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${f.name}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {files.length > 1 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-zinc-500 hover:text-red-600"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
