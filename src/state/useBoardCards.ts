import { useCallback, useEffect, useState } from "react";
import type { Card, CardUpdateInput, NewCardInput } from "../shared/types";

export type CardsByColumn = Record<number, Card[]>;

function groupByColumn(cards: Card[]): CardsByColumn {
  const grouped: CardsByColumn = {};
  for (const card of cards) {
    (grouped[card.column_id] ??= []).push(card);
  }
  for (const list of Object.values(grouped)) {
    list.sort((a, b) => a.position - b.position);
  }
  return grouped;
}

export function useBoardCards(boardId: number) {
  const [cardsByColumn, setCardsByColumn] = useState<CardsByColumn>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await window.taskApi.cards.listByBoard(boardId);
    setCardsByColumn(groupByColumn(list));
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    refresh().then(() => setLoading(false));
  }, [refresh]);

  const createCard = useCallback(
    async (columnId: number, input: NewCardInput) => {
      await window.taskApi.cards.create(columnId, input);
      await refresh();
    },
    [refresh],
  );

  const updateCard = useCallback(
    async (id: number, fields: CardUpdateInput) => {
      await window.taskApi.cards.update(id, fields);
      await refresh();
    },
    [refresh],
  );

  const deleteCard = useCallback(
    async (id: number) => {
      await window.taskApi.cards.delete(id);
      await refresh();
    },
    [refresh],
  );

  // Persists the final card order for one or two columns after a drag ends,
  // then resyncs from storage (the local optimistic state may be slightly
  // stale relative to what was just written).
  const commitOrder = useCallback(
    async (columns: { columnId: number; cardIds: number[] }[]) => {
      await Promise.all(
        columns.map(({ columnId, cardIds }) => window.taskApi.cards.reorderColumn(columnId, cardIds)),
      );
      await refresh();
    },
    [refresh],
  );

  return { cardsByColumn, setCardsByColumn, loading, createCard, updateCard, deleteCard, commitOrder };
}
