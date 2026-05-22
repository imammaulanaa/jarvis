"use client"

import { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"

interface Props {
  tags:        string[]
  onChange:    (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder = "Add tag..." }: Props) {
  const [input, setInput] = useState("")

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase().replace(/\s+/g, "-")
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 px-3 py-2 rounded-lg border min-h-[38px] cursor-text focus-within:border-sky-500 transition-colors"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
      onClick={() => document.getElementById("tag-input-field")?.focus()}
    >
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-jarvis"
          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-red-400 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        id="tag-input-field"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input) addTag(input) }}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 bg-transparent outline-none text-xs font-mono-jarvis min-w-[80px]"
        style={{ color: "var(--text-primary)" }}
      />
    </div>
  )
}