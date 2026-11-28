"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback } from "react";

function Btn({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active}
      className={`min-w-9 rounded-sm px-2 py-1.5 text-sm font-semibold ${active ? "bg-ink text-on-ink" : "hover:bg-black/10"}`}
    >
      {children}
    </button>
  );
}

/**
 * Rich-text editor (Tiptap). Output is HTML, which the server sanitises again
 * on save and on render, so nothing the editor (or a tampered form) sends is trusted.
 */
export function RichTextEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } },
        code: false, codeBlock: false,
      }),
    ],
    content: initialHtml,
    immediatelyRender: false, // avoids SSR hydration mismatch
    editorProps: {
      attributes: { class: "article-body min-h-[18rem] px-4 py-3 focus:outline-none", "aria-label": "Article body" },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://…). Leave empty to remove the link.", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) { window.alert("Links must start with https://, http://, mailto: or tel:"); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  if (!editor) return <div className="min-h-[20rem] border border-rule bg-white" aria-busy="true" />;

  const c = () => editor.chain().focus();

  return (
    <div className="border border-rule bg-white">
      <div className="flex flex-wrap gap-1 border-b border-rule bg-chip p-1.5" role="toolbar" aria-label="Formatting">
        <Btn label="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}><b>B</b></Btn>
        <Btn label="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><i>I</i></Btn>
        <Btn label="Underline" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}><u>U</u></Btn>
        <span className="mx-1 w-px bg-rule" aria-hidden />
        <Btn label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <span className="mx-1 w-px bg-rule" aria-hidden />
        <Btn label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}>• List</Btn>
        <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}>1. List</Btn>
        <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}>“ ”</Btn>
        <Btn label="Link" active={editor.isActive("link")} onClick={setLink}>Link</Btn>
        <span className="mx-1 w-px bg-rule" aria-hidden />
        <Btn label="Undo" onClick={() => c().undo().run()}>↶</Btn>
        <Btn label="Redo" onClick={() => c().redo().run()}>↷</Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
