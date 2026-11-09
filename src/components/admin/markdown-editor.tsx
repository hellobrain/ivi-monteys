"use client";

import { useRef, useState } from "react";
import { Markdown } from "@/components/ui/markdown";

const snippets: { label: string; title: string; insert: string }[] = [
  { label: "H2", title: "Heading", insert: "\n## Heading\n" },
  { label: "B", title: "Bold", insert: "**bold**" },
  { label: "I", title: "Italic", insert: "*italic*" },
  { label: "❝", title: "Quotation", insert: "\n> Quoted passage. (Source, locator)\n" },
  { label: "List", title: "List", insert: "\n- First\n- Second\n" },
  { label: "Table", title: "Comparison table", insert: "\n| Reading | Source | Layer |\n| --- | --- | --- |\n| … | … | … |\n" },
  { label: "Animal", title: "Link to an animal", insert: "[[animal:slug|label]]" },
  { label: "Source", title: "Cite a primary source", insert: "[[source:slug|Author, Title]]" },
  { label: "Bib", title: "Cite bibliography", insert: "[[bib:slug|Author Year]]" },
  { label: "MS", title: "Link a manuscript", insert: "[[manuscript:slug|label]]" },
];

/** Markdown editor: no raw HTML is ever rendered; references use [[kind:slug|label]] tokens. */
export function MarkdownEditor({ name, defaultValue, id, invalid }: { name: string; defaultValue: string; id: string; invalid?: boolean }) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = (text: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const next = value.slice(0, a) + text + value.slice(b);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + text.length, a + text.length);
    });
  };

  return (
    <div className="border border-rule">
      <div className="flex flex-wrap items-center gap-1 border-b border-rule p-2" role="toolbar" aria-label="Formatting">
        {snippets.map((s) => (
          <button key={s.label} type="button" title={s.title} onClick={() => insert(s.insert)} className="label border border-rule px-2 py-0.5 hover:border-paper" disabled={preview}>
            {s.label}
          </button>
        ))}
        <button type="button" onClick={() => setPreview((p) => !p)} className="label ml-auto underline" aria-pressed={preview}>
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="max-h-[32rem] overflow-auto p-4">
          <Markdown>{value || "_Nothing to preview._"}</Markdown>
        </div>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={invalid}
        className={`min-h-64 w-full bg-transparent p-4 font-mono text-[0.95rem] leading-relaxed text-paper outline-none ${preview ? "hidden" : ""}`}
      />
    </div>
  );
}
