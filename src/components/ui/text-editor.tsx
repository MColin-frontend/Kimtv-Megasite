"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { useEffect } from "react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Undo2,
  Redo2,
  Heading2,
} from "lucide-react"

import { cn } from "@/lib/utils"

/* ── Toolbar button ───────────────────────────────────────── */

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-6 flex size-7 items-center justify-center transition-colors",
        active
          ? "bg-amber-400/15 text-amber-400"
          : "text-white/40 hover:bg-white/8 hover:text-white",
        disabled && "pointer-events-none opacity-30"
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-0.5 h-4 w-px bg-white/10" />
}

/* ── Props ────────────────────────────────────────────────── */

interface TextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

/* ── Main ─────────────────────────────────────────────────── */

export function TextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  minHeight = 160,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? "",
    editorProps: {
      attributes: {
        class: "outline-none text-white/90 text-14 leading-163 min-h-[var(--min-h)] px-4 py-3",
        style: `--min-h: ${minHeight}px`,
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || value === undefined) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  function setLink() {
    const url = window.prompt("URL", editor!.getAttributes("link").href ?? "")
    if (url === null) return
    if (!url) { editor!.chain().focus().extendMarkRange("link").unsetLink().run(); return }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className={cn("rounded-8 flex flex-col overflow-hidden border border-white/8 bg-white/[0.03] transition-colors focus-within:border-white/25", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/8 px-2 py-1.5">
        <ToolBtn title="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="size-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough className="size-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="size-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight className="size-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Link" onClick={setLink} active={editor.isActive("link")}>
          <Link2 className="size-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="size-3.5" />
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="size-3.5" />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
