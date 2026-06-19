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

  if (editing) {
    return (
      <div className="kanban-card" style={{ borderLeftColor: card.color }}>
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
      className="kanban-card"
      style={{ borderLeftColor: card.color }}
      onClick={() => setEditing(true)}
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
