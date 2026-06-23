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
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { Card, Column } from "../shared/types";
import { useBoardCards, type CardsByColumn } from "../state/useBoardCards";
import { useColumns } from "../state/useColumns";
import { cardTintStyle } from "./CardItem";
import { CardList } from "./CardList";
import { ErrorBanner } from "./ErrorBanner";

interface KanbanBoardProps {
  boardId: number;
}

// Columns are dragged as a flat horizontal list, separately from cards
// (which drag across columns). Both share one DndContext, so column
// sortable ids are prefixed to keep them out of the card id namespace —
// otherwise a column and a card with the same numeric id would collide.
const COLUMN_ID_PREFIX = "col-";

function columnSortableId(id: number): string {
  return `${COLUMN_ID_PREFIX}${id}`;
}

function parseColumnId(id: number | string): number | null {
  if (typeof id !== "string" || !id.startsWith(COLUMN_ID_PREFIX)) return null;
  return Number(id.slice(COLUMN_ID_PREFIX.length));
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

interface SortableColumnItemProps {
  column: Column;
  children: ReactNode;
  editing: boolean;
  editingName: string;
  onStartRename: (column: Column) => void;
  onEditingNameChange: (name: string) => void;
  onCommitRename: (id: number) => void;
  onRenameKeyDown: (e: KeyboardEvent<HTMLInputElement>, id: number) => void;
  onDelete: (column: Column) => void;
}

function SortableColumnItem({
  column,
  children,
  editing,
  editingName,
  onStartRename,
  onEditingNameChange,
  onCommitRename,
  onRenameKeyDown,
  onDelete,
}: SortableColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnSortableId(column.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-column">
      <div className="kanban-column-header">
        <span className="column-drag-handle" aria-label="Drag to reorder" {...attributes} {...listeners}>
          ⠿
        </span>
        {editing ? (
          <input
            autoFocus
            className="column-name-input"
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onBlur={() => onCommitRename(column.id)}
            onKeyDown={(e) => onRenameKeyDown(e, column.id)}
          />
        ) : (
          <h3 onDoubleClick={() => onStartRename(column)}>{column.name}</h3>
        )}
        <button
          type="button"
          className="column-delete"
          aria-label={`Delete ${column.name}`}
          onClick={() => onDelete(column)}
        >
          ×
        </button>
      </div>
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
    reorderColumns,
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
  const [addingColumn, setAddingColumn] = useState(false);
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
    setAddingColumn(false);
  }

  function cancelAddColumn() {
    setNewName("");
    setAddingColumn(false);
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
    if (parseColumnId(event.active.id) != null) return;
    const id = Number(event.active.id);
    const containerId = findContainerId(cardsByColumn, id);
    const card = containerId != null ? cardsByColumn[containerId]?.find((c) => c.id === id) : null;
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (parseColumnId(event.active.id) != null) return;
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
    const { active, over } = event;

    const activeColumnId = parseColumnId(active.id);
    if (activeColumnId != null) {
      const overColumnId = over ? parseColumnId(over.id) : null;
      if (overColumnId != null && overColumnId !== activeColumnId) {
        const activeIndex = columns.findIndex((c) => c.id === activeColumnId);
        const overIndex = columns.findIndex((c) => c.id === overColumnId);
        if (activeIndex !== -1 && overIndex !== -1) {
          reorderColumns(arrayMove(columns, activeIndex, overIndex).map((c) => c.id));
        }
      }
      return;
    }

    setActiveCard(null);
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
        <SortableContext
          items={columns.map((c) => columnSortableId(c.id))}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <SortableColumnItem
              key={column.id}
              column={column}
              editing={editingId === column.id}
              editingName={editingName}
              onStartRename={startRename}
              onEditingNameChange={setEditingName}
              onCommitRename={commitRename}
              onRenameKeyDown={handleRenameKeyDown}
              onDelete={handleDeleteColumn}
            >
              <ColumnDropZone columnId={column.id}>
                <CardList
                  columnId={column.id}
                  cards={cardsByColumn[column.id] ?? []}
                  onCreate={createCard}
                  onUpdate={updateCard}
                  onDelete={deleteCard}
                />
              </ColumnDropZone>
            </SortableColumnItem>
          ))}
        </SortableContext>
        <div className="kanban-add-column">
          {addingColumn ? (
            <form onSubmit={handleCreate}>
              <input
                autoFocus
                placeholder="Column name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && cancelAddColumn()}
              />
              <button type="submit">Add column</button>
            </form>
          ) : (
            <button type="button" className="add-trigger" onClick={() => setAddingColumn(true)}>
              + New column
            </button>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeCard && (
          <div
            className="kanban-card kanban-card-overlay"
            style={{ borderLeftColor: activeCard.color, ...cardTintStyle(activeCard.color) }}
          >
            <span className="kanban-card-title">{activeCard.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
    </>
  );
}
