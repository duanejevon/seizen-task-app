import { useCallback, useEffect, useState } from "react";
import type { Card, CardUpdateInput, NewCardInput } from "../shared/types";
import { toErrorMessage } from "./errorMessage";

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
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await window.taskApi.cards.listByBoard(boardId);
    setCardsByColumn(groupByColumn(list));
    setError(null);
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch((err) => setError(toErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  const createCard = useCallback(
    async (columnId: number, input: NewCardInput) => {
      try {
        await window.taskApi.cards.create(columnId, input);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const updateCard = useCallback(
    async (id: number, fields: CardUpdateInput) => {
      try {
        await window.taskApi.cards.update(id, fields);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const deleteCard = useCallback(
    async (id: number) => {
      try {
        await window.taskApi.cards.delete(id);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  // Persists the final card order for one or two columns after a drag ends,
  // then resyncs from storage either way — on success because the local
  // optimistic state may be slightly stale, and on failure because the
  // optimistic reorder needs to be rolled back to what's actually stored.
  const commitOrder = useCallback(
    async (columns: { columnId: number; cardIds: number[] }[]) => {
      try {
        await Promise.all(
          columns.map(({ columnId, cardIds }) =>
            window.taskApi.cards.reorderColumn(columnId, cardIds),
          ),
        );
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        await refresh();
      }
    },
    [refresh],
  );

  return {
    cardsByColumn,
    setCardsByColumn,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    commitOrder,
    retry: refresh,
  };
}
