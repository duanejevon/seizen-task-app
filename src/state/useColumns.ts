import { useCallback, useEffect, useState } from "react";
import type { Column } from "../shared/types";
import { toErrorMessage } from "./errorMessage";

export function useColumns(boardId: number | null) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (boardId == null) {
      setColumns([]);
      return [];
    }
    const list = await window.taskApi.columns.list(boardId);
    setColumns(list);
    setError(null);
    return list;
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch((err) => setError(toErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  const createColumn = useCallback(
    async (name: string) => {
      if (boardId == null) return;
      try {
        await window.taskApi.columns.create(boardId, name);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [boardId, refresh],
  );

  const renameColumn = useCallback(
    async (id: number, name: string) => {
      try {
        await window.taskApi.columns.rename(id, name);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const deleteColumn = useCallback(
    async (id: number) => {
      try {
        await window.taskApi.columns.delete(id);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  return { columns, loading, error, createColumn, renameColumn, deleteColumn, retry: refresh };
}
