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

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    borderLeftColor: card.color,
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
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete card "${card.title}"?`)) onDelete(card.id);
          }}
        >
          ×
        </button>
      </div>
      {card.description && <p className="kanban-card-description">{card.description}</p>}
    </div>
  );
}
