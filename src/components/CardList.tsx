import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import type { Card } from "../shared/types";
import { CardForm, type CardFormValues } from "./CardForm";
import { CardItem } from "./CardItem";

interface CardListProps {
  columnId: number;
  cards: Card[];
  onCreate: (columnId: number, values: CardFormValues) => void;
  onUpdate: (id: number, values: CardFormValues) => void;
  onDelete: (id: number) => void;
}

export function CardList({ columnId, cards, onCreate, onUpdate, onDelete }: CardListProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="kanban-card-list">
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {cards.map((card) => (
          <CardItem key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </SortableContext>
      {adding ? (
        <CardForm
          submitLabel="Add card"
          onSubmit={(values) => {
            onCreate(columnId, values);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="kanban-add-card" onClick={() => setAdding(true)}>
          + Add card
        </button>
      )}
    </div>
  );
}
