import { BoardSwitcher } from "./components/BoardSwitcher";
import { ErrorBanner } from "./components/ErrorBanner";
import { KanbanBoard } from "./components/KanbanBoard";
import { useBoards } from "./state/useBoards";
import { useDueDateReminders } from "./state/useDueDateReminders";

function App() {
  const {
    boards,
    activeBoardId,
    loading,
    error,
    createBoard,
    renameBoard,
    deleteBoard,
    switchBoard,
    retry,
  } = useBoards();
  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;
  useDueDateReminders();

  return (
    <div className="app-shell">
      <BoardSwitcher
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitch={switchBoard}
        onCreate={createBoard}
        onRename={renameBoard}
        onDelete={deleteBoard}
      />
      <main className="board-content">
        {error && <ErrorBanner message={error} onRetry={retry} />}
        {loading ? (
          <p>Loading…</p>
        ) : activeBoard ? (
          <>
            <h1>{activeBoard.name}</h1>
            <KanbanBoard boardId={activeBoard.id} />
          </>
        ) : (
          <p>No boards yet — create one to get started.</p>
        )}
      </main>
    </div>
  );
}

export default App;
