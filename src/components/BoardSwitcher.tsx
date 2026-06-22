import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Board } from "../shared/types";
import type { useBackground } from "../state/useBackground";
import { AppMenu } from "./AppMenu";

interface BoardSwitcherProps {
  boards: Board[];
  activeBoardId: number | null;
  onSwitch: (id: number) => void;
  onCreate: (name: string) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  background: ReturnType<typeof useBackground>;
}

export function BoardSwitcher({
  boards,
  activeBoardId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  background,
}: BoardSwitcherProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName("");
  }

  function startRename(board: Board) {
    setEditingId(board.id);
    setEditingName(board.name);
  }

  function commitRename(id: number) {
    const name = editingName.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  }

  function handleRenameKeyDown(e: KeyboardEvent<HTMLInputElement>, id: number) {
    if (e.key === "Enter") commitRename(id);
    if (e.key === "Escape") setEditingId(null);
  }

  function handleDelete(board: Board) {
    if (window.confirm(`Delete board "${board.name}"? This cannot be undone.`)) {
      onDelete(board.id);
    }
  }

  return (
    <nav className="board-switcher">
      <div className="board-switcher-header">
        <AppMenu background={background} />
        <h2>Boards</h2>
      </div>
      <ul>
        {boards.map((board) => (
          <li key={board.id} className={board.id === activeBoardId ? "active" : ""}>
            {editingId === board.id ? (
              <input
                autoFocus
                className="board-name-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => commitRename(board.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, board.id)}
              />
            ) : (
              <button
                type="button"
                className="board-name"
                onClick={() => onSwitch(board.id)}
                onDoubleClick={() => startRename(board)}
              >
                {board.name}
              </button>
            )}
            <button
              type="button"
              className="board-delete"
              aria-label={`Delete ${board.name}`}
              onClick={() => handleDelete(board)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreate} className="board-create">
        <input
          placeholder="New board name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </nav>
  );
}
