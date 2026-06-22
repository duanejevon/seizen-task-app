import { useState, type FormEvent } from "react";
import type { Card } from "../shared/types";
import { CARD_COLORS, CardColorPicker } from "./CardColorPicker";

export interface CardFormValues {
  title: string;
  description: string;
  color: string;
  due_date: string | null;
}

interface CardFormProps {
  initial?: Card | null;
  submitLabel: string;
  onSubmit: (values: CardFormValues) => void;
  onCancel: () => void;
}

export function CardForm({ initial, submitLabel, onSubmit, onCancel }: CardFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0]);
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, description, color, due_date: dueDate || null });
  }

  return (
    <form className="card-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <CardColorPicker value={color} onChange={setColor} />
      <div className="card-form-due">
        <input
          type="datetime-local"
          aria-label="Due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {dueDate && (
          <button type="button" className="card-form-due-clear" onClick={() => setDueDate("")}>
            Clear
          </button>
        )}
      </div>
      <div className="card-form-actions">
        <button type="submit">{submitLabel}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
