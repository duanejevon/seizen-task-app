import { useState } from "react";
import { useCards } from "../state/useCards";
import { CardForm } from "./CardForm";
import { CardItem } from "./CardItem";

interface CardListProps {
  columnId: number;
}

export function CardList({ columnId }: CardListProps) {
  const { cards, loading, createCard, updateCard, deleteCard } = useCards(columnId);
  const [adding, setAdding] = useState(false);

  if (loading) return <p className="kanban-card-loading">Loading…</p>;

  return (
    <div className="kanban-card-list">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onUpdate={updateCard} onDelete={deleteCard} />
      ))}
      {adding ? (
        <CardForm
          submitLabel="Add card"
          onSubmit={(values) => {
            createCard(values);
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
