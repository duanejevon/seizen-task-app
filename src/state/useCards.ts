import { useCallback, useEffect, useState } from "react";
import type { Card, CardUpdateInput, NewCardInput } from "../shared/types";

export function useCards(columnId: number) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await window.taskApi.cards.list(columnId);
    setCards(list);
    return list;
  }, [columnId]);

  useEffect(() => {
    setLoading(true);
    refresh().then(() => setLoading(false));
  }, [refresh]);

  const createCard = useCallback(
    async (input: NewCardInput) => {
      await window.taskApi.cards.create(columnId, input);
      await refresh();
    },
    [columnId, refresh],
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

  return { cards, loading, createCard, updateCard, deleteCard };
}
