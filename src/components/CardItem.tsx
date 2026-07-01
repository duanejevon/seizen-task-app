import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Card } from "../shared/types";
import { CardForm, type CardFormValues } from "./CardForm";

interface CardItemProps {
  card: Card;
  onUpdate: (id: number, fields: CardFormValues) => void;
  onDelete: (id: number) => void;
}

// Painted as a background-image gradient (not background-color) so it
// layers on top of the existing translucent --surface-1 glass background
// instead of replacing it.
export function cardTintStyle(hex: string): { backgroundImage: string } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const tint = `rgba(${r}, ${g}, ${b}, 0.16)`;
  return { backgroundImage: `linear-gradient(${tint}, ${tint})` };
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return dueDate;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    borderLeftColor: card.color,
    ...cardTintStyle(card.color),
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (editing) {
    return (
      <div ref={setNodeRef} className="kanban-card" style={style}>
        <CardForm
          initial={card}
          submitLabel="Save"
          onSubmit={(values) => {
            onUpdate(card.id, values);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="kanban-card"
      style={style}
      onClick={() => setEditing(true)}
      {...attributes}
      {...listeners}
    >
      <div className="kanban-card-header">
        <span className="kanban-card-title">{card.title}</span>
        <button
          type="button"
          className="card-delete"
          aria-label={`Delete ${card.title}`}
          // Keep pointerdown from reaching the card's drag listeners: otherwise
          // the synchronous window.confirm below interrupts an in-progress dnd-kit
          // pointer interaction, stranding its document-level selection/click
          // listeners and leaving every text input unusable ("readonly").
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete card "${card.title}"?`)) onDelete(card.id);
          }}
        >
          ×
        </button>
      </div>
      {card.description && <p className="kanban-card-description">{card.description}</p>}
      {card.due_date && (
        <span
          className={
            "kanban-card-due" + (new Date(card.due_date).getTime() <= Date.now() ? " overdue" : "")
          }
        >
          {formatDueDate(card.due_date)}
        </span>
      )}
    </div>
  );
}
