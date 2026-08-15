import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { useEffect } from "react";
import {
  FiBold,
  FiItalic,
  FiLink,
  FiImage,
  FiList,
  FiCode,
  FiCornerDownLeft,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi";
import { MdFormatListNumbered, MdFormatQuote, MdOutlineTableChart, MdStrikethroughS } from "react-icons/md";
import { cn } from "@/lib/cn";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-base-300 transition-colors hover:bg-base-700 hover:text-base-50",
        active && "bg-hero/15 text-hero hover:bg-hero/20 hover:text-hero"
      )}
    >
      {children}
    </button>
  );
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  error?: string;
  /** Every image field on this portfolio is a URL link, never an upload — see Phase 10 plan notes. */
  placeholder?: string;
}

/**
 * Tiptap rich-text editor. Output HTML is sanitized server-side on every
 * save (`sanitizeRichText` in the shared sanitize lib, wired into the
 * projects/blog admin routes) and again client-side wherever it's rendered
 * (`lib/sanitize.ts`'s `sanitizeHtml`) — this component itself does no
 * sanitization, it only authors the markup.
 */
export function RichTextEditor({ value, onChange, label, error, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[240px] px-3.5 py-3 focus:outline-none " +
          "prose-headings:text-base-50 prose-p:text-base-200 prose-a:text-hero prose-strong:text-base-50 " +
          "prose-code:text-base-100 prose-blockquote:text-base-300 prose-blockquote:border-base-600",
      },
    },
  });

  // Keep the editor in sync when `value` changes out from under it (e.g. the
  // form resets after the entity finishes loading) without fighting the
  // user's own typing on every keystroke.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    // eslint-disable-next-line no-alert
    const url = window.prompt("Link URL (http/https)", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage() {
    if (!editor) return;
    // eslint-disable-next-line no-alert
    const url = window.prompt("Image URL (http/https) — images are link-only, no uploads");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-base-200">{label}</span>}
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-base-600 bg-base-800 focus-within:border-hero focus-within:ring-2 focus-within:ring-hero/30",
          error && "border-danger focus-within:ring-danger/30"
        )}
      >
        <div className="flex flex-wrap items-center gap-0.5 border-b border-base-700 bg-base-800/80 p-1.5">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FiBold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FiItalic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <MdStrikethroughS className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-base-700" aria-hidden="true" />
          {([2, 3, 4] as const).map((level) => (
            <ToolbarButton
              key={level}
              label={`Heading ${level}`}
              active={editor.isActive("heading", { level })}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            >
              <span className="text-xs font-semibold">H{level}</span>
            </ToolbarButton>
          ))}
          <div className="mx-1 h-5 w-px bg-base-700" aria-hidden="true" />
          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FiList className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <MdFormatListNumbered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <MdFormatQuote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <FiCode className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-base-700" aria-hidden="true" />
          <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
            <FiLink className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Insert image (URL)" onClick={insertImage}>
            <FiImage className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Insert table"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <MdOutlineTableChart className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <FiCornerDownLeft className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-base-700" aria-hidden="true" />
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <FiRotateCcw className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <FiRotateCw className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
