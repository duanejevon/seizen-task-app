import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Column } from "../shared/types";
import { useColumns } from "../state/useColumns";
import { CardList } from "./CardList";

interface KanbanBoardProps {
  boardId: number;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { columns, loading, createColumn, renameColumn, deleteColumn } = useColumns(boardId);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    createColumn(name);
    setNewName("");
  }

  function startRename(column: Column) {
    setEditingId(column.id);
    setEditingName(column.name);
  }

  function commitRename(id: number) {
    const name = editingName.trim();
    if (name) renameColumn(id, name);
    setEditingId(null);
  }

  function handleRenameKeyDown(e: KeyboardEvent<HTMLInputElement>, id: number) {
    if (e.key === "Enter") commitRename(id);
    if (e.key === "Escape") setEditingId(null);
  }

  function handleDelete(column: Column) {
    if (window.confirm(`Delete column "${column.name}"? Cards inside it will be deleted too.`)) {
      deleteColumn(column.id);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="kanban-board">
      {columns.length === 0 && (
        <p className="kanban-empty">No columns yet — add one to start organizing tasks.</p>
      )}
      {columns.map((column) => (
        <div key={column.id} className="kanban-column">
          <div className="kanban-column-header">
            {editingId === column.id ? (
              <input
                autoFocus
                className="column-name-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => commitRename(column.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, column.id)}
              />
            ) : (
              <h3 onDoubleClick={() => startRename(column)}>{column.name}</h3>
            )}
            <button
              type="button"
              className="column-delete"
              aria-label={`Delete ${column.name}`}
              onClick={() => handleDelete(column)}
            >
              ×
            </button>
          </div>
          <div className="kanban-column-cards">
            <CardList columnId={column.id} />
          </div>
        </div>
      ))}
      <form onSubmit={handleCreate} className="kanban-add-column">
        <input
          placeholder="New column name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit">Add column</button>
      </form>
    </div>
  );
}
