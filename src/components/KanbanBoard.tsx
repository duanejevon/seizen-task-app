import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { Card, Column } from "../shared/types";
import { useBoardCards, type CardsByColumn } from "../state/useBoardCards";
import { useColumns } from "../state/useColumns";
import { CardList } from "./CardList";
import { ErrorBanner } from "./ErrorBanner";

interface KanbanBoardProps {
  boardId: number;
}

function findContainerId(cardsByColumn: CardsByColumn, id: number | string): number | null {
  if (typeof id === "string" && id.startsWith("column-")) {
    return Number(id.slice("column-".length));
  }
  const numericId = Number(id);
  for (const [columnId, cards] of Object.entries(cardsByColumn)) {
    if (cards.some((c) => c.id === numericId)) return Number(columnId);
  }
  return null;
}

function ColumnDropZone({ columnId, children }: { columnId: number; children: ReactNode }) {
  const { setNodeRef } = useDroppable({ id: `column-${columnId}` });
  return (
    <div ref={setNodeRef} className="kanban-column-cards">
      {children}
    </div>
  );
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const {
    columns,
    loading: columnsLoading,
    error: columnsError,
    createColumn,
    renameColumn,
    deleteColumn,
    retry: retryColumns,
  } = useColumns(boardId);
  const {
    cardsByColumn,
    setCardsByColumn,
    loading: cardsLoading,
    error: cardsError,
    createCard,
    updateCard,
    deleteCard,
    commitOrder,
    retry: retryCards,
  } = useBoardCards(boardId);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

  function handleDeleteColumn(column: Column) {
    if (window.confirm(`Delete column "${column.name}"? Cards inside it will be deleted too.`)) {
      deleteColumn(column.id);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const id = Number(event.active.id);
    const containerId = findContainerId(cardsByColumn, id);
    const card = containerId != null ? cardsByColumn[containerId]?.find((c) => c.id === id) : null;
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = Number(active.id);
    const activeContainer = findContainerId(cardsByColumn, activeId);
    const overContainer = findContainerId(cardsByColumn, over.id);
    if (activeContainer == null || overContainer == null || activeContainer === overContainer) return;

    const activeItems = cardsByColumn[activeContainer] ?? [];
    const overItems = cardsByColumn[overContainer] ?? [];
    const activeIndex = activeItems.findIndex((c) => c.id === activeId);
    if (activeIndex === -1) return;
    const overIndex = overItems.findIndex((c) => c.id === Number(over.id));

    const movedCard = { ...activeItems[activeIndex], column_id: overContainer };
    const newActiveItems = activeItems.filter((c) => c.id !== activeId);
    const insertAt = overIndex >= 0 ? overIndex : overItems.length;
    const newOverItems = [...overItems.slice(0, insertAt), movedCard, ...overItems.slice(insertAt)];

    setCardsByColumn({
      ...cardsByColumn,
      [activeContainer]: newActiveItems,
      [overContainer]: newOverItems,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const activeContainer = findContainerId(cardsByColumn, activeId);
    if (activeContainer == null) return;
    const overContainer = findContainerId(cardsByColumn, over.id) ?? activeContainer;

    let finalCardsByColumn = cardsByColumn;
    if (activeContainer === overContainer) {
      const items = cardsByColumn[activeContainer] ?? [];
      const activeIndex = items.findIndex((c) => c.id === activeId);
      const overIndex = items.findIndex((c) => c.id === Number(over.id));
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        finalCardsByColumn = { ...cardsByColumn, [activeContainer]: arrayMove(items, activeIndex, overIndex) };
        setCardsByColumn(finalCardsByColumn);
      }
    }

    const affected =
      activeContainer === overContainer ? [activeContainer] : [activeContainer, overContainer];
    commitOrder(
      affected.map((columnId) => ({
        columnId,
        cardIds: (finalCardsByColumn[columnId] ?? []).map((c) => c.id),
      })),
    );
  }

  if (columnsLoading || cardsLoading) return <p>Loading…</p>;

  return (
    <>
      {columnsError && <ErrorBanner message={columnsError} onRetry={retryColumns} />}
      {cardsError && <ErrorBanner message={cardsError} onRetry={retryCards} />}
      <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
                onClick={() => handleDeleteColumn(column)}
              >
                ×
              </button>
            </div>
            <ColumnDropZone columnId={column.id}>
              <CardList
                columnId={column.id}
                cards={cardsByColumn[column.id] ?? []}
                onCreate={createCard}
                onUpdate={updateCard}
                onDelete={deleteCard}
              />
            </ColumnDropZone>
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
      <DragOverlay>
        {activeCard && (
          <div className="kanban-card kanban-card-overlay" style={{ borderLeftColor: activeCard.color }}>
            <span className="kanban-card-title">{activeCard.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
    </>
  );
}
