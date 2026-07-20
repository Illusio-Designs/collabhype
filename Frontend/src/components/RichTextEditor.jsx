'use client';

import { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { uploadImage } from '@/lib/apiClient';
import { useToast } from '@/components/ui';

// react-quill touches the DOM, so it must be client-only (no SSR). next/dynamic
// doesn't forward refs, so wrap it to pass `forwardedRef` through as `ref`.
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    function QuillWithRef({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    }
    return QuillWithRef;
  },
  {
    ssr: false,
    loading: () => (
      <div className="grid h-48 place-items-center rounded-lg border border-zinc-200 text-sm text-zinc-400">
        Loading editor…
      </div>
    ),
  },
);

// Full-featured rich text editor. `value` is HTML; `onChange(html)`.
export default function RichTextEditor({ value, onChange, placeholder = 'Write your post…' }) {
  const quillRef = useRef(null);
  const toast = useToast();

  // Upload images to our backend and insert the returned URL, instead of
  // embedding huge base64 blobs in the HTML.
  const imageHandler = useMemo(
    () => async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const url = await uploadImage(file, 'blog');
          const editor = quillRef.current?.getEditor();
          const range = editor?.getSelection(true);
          editor?.insertEmbed(range ? range.index : 0, 'image', url, 'user');
          if (range) editor.setSelection(range.index + 1);
        } catch {
          toast.push({ variant: 'danger', title: 'Image upload failed', body: 'Please try again.' });
        }
      };
      input.click();
    },
    [],
  );

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler],
  );

  return (
    <div className="rich-text-editor">
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 260px;
          font-size: 15px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
