import { useCallback, useEffect, useState } from "react";
import type { Board } from "../shared/types";
import { toErrorMessage } from "./errorMessage";

const ACTIVE_BOARD_KEY = "seizen:activeBoardId";

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(() => {
    const stored = localStorage.getItem(ACTIVE_BOARD_KEY);
    return stored ? Number(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await window.taskApi.boards.list();
    setBoards(list);
    setError(null);
    return list;
  }, []);

  useEffect(() => {
    refresh()
      .then((list) => {
        setActiveBoardId((current) =>
          current != null && list.some((b) => b.id === current) ? current : list[0]?.id ?? null,
        );
      })
      .catch((err) => setError(toErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (activeBoardId != null) {
      localStorage.setItem(ACTIVE_BOARD_KEY, String(activeBoardId));
    } else {
      localStorage.removeItem(ACTIVE_BOARD_KEY);
    }
  }, [activeBoardId]);

  const createBoard = useCallback(
    async (name: string) => {
      try {
        const board = await window.taskApi.boards.create(name);
        await refresh();
        setActiveBoardId(board.id);
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const renameBoard = useCallback(
    async (id: number, name: string) => {
      try {
        await window.taskApi.boards.rename(id, name);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const deleteBoard = useCallback(
    async (id: number) => {
      try {
        await window.taskApi.boards.delete(id);
        const list = await refresh();
        setActiveBoardId((current) => (current !== id ? current : list[0]?.id ?? null));
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const switchBoard = useCallback((id: number) => {
    setActiveBoardId(id);
  }, []);

  const setBoardIcon = useCallback(
    async (id: number, icon: string) => {
      try {
        await window.taskApi.boards.setIcon(id, icon);
        await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  const browseBoardIcon = useCallback(
    async (id: number) => {
      try {
        const updated = await window.taskApi.boards.browseIcon(id);
        if (updated) await refresh();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [refresh],
  );

  // Reorders local state immediately so the drag feels responsive, then
  // persists; refreshes either way to resync with storage (and roll back
  // the optimistic order if the IPC call failed).
  const reorderBoards = useCallback(
    async (boardIds: number[]) => {
      setBoards((current) => {
        const byId = new Map(current.map((b) => [b.id, b]));
        const reordered = boardIds.map((id) => byId.get(id)).filter((b) => b != null);
        return reordered.length === current.length ? reordered : current;
      });
      try {
        await window.taskApi.boards.reorder(boardIds);
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        await refresh();
      }
    },
    [refresh],
  );

  return {
    boards,
    activeBoardId,
    loading,
    error,
    createBoard,
    renameBoard,
    deleteBoard,
    switchBoard,
    setBoardIcon,
    browseBoardIcon,
    reorderBoards,
    retry: refresh,
  };
}
