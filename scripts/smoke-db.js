const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createStore } = require("../electron/db");

const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "taskapp-smoke-")), "smoke.db");

try {
  let store = createStore(dbPath);
  const board = store.createBoard("Smoke Board");
  const todo = store.createColumn(board.id, "Todo");
  const doing = store.createColumn(board.id, "Doing");
  const cardA = store.createCard(todo.id, { title: "First card", color: "#ff6b6b" });
  const cardB = store.createCard(todo.id, { title: "Second card", color: "#4ade80" });
  store.close();

  // Reopen against the same file to simulate an app restart.
  store = createStore(dbPath);
  const boards = store.listBoards();
  assert.strictEqual(boards.length, 1);
  assert.strictEqual(boards[0].name, "Smoke Board");

  const columns = store.listColumns(boards[0].id);
  assert.strictEqual(columns.length, 2);

  const cards = store.listCards(todo.id);
  assert.strictEqual(cards.length, 2);
  assert.strictEqual(cards[0].title, "First card");
  assert.strictEqual(cards[0].color, "#ff6b6b");

  const allBoardCards = store.listCardsByBoard(board.id);
  assert.strictEqual(allBoardCards.length, 2);

  // Drag cardB into "Doing" ahead of nothing else, and leave cardA alone in "Todo".
  store.reorderColumn(doing.id, [cardB.id]);
  store.reorderColumn(todo.id, [cardA.id]);
  store.close();

  store = createStore(dbPath);
  const todoCards = store.listCards(todo.id);
  const doingCards = store.listCards(doing.id);
  assert.strictEqual(todoCards.length, 1);
  assert.strictEqual(todoCards[0].id, cardA.id);
  assert.strictEqual(doingCards.length, 1);
  assert.strictEqual(doingCards[0].id, cardB.id);
  assert.strictEqual(doingCards[0].position, 0);

  store.close();
  console.log("smoke-db: OK — data and drag-and-drop reordering persisted across store reopen");
} finally {
  fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
}
