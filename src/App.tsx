import { BoardSwitcher } from "./components/BoardSwitcher";
import { ErrorBanner } from "./components/ErrorBanner";
import { KanbanBoard } from "./components/KanbanBoard";
import { useBackground } from "./state/useBackground";
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
  // Hooked here (not inside BackgroundPicker) so the background applies on
  // launch regardless of whether the app menu has ever been opened.
  const background = useBackground();

  return (
    <div className="app-shell">
      <BoardSwitcher
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitch={switchBoard}
        onCreate={createBoard}
        onRename={renameBoard}
        onDelete={deleteBoard}
        background={background}
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
