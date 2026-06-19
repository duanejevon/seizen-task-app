const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createStore } = require("../electron/db");

const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "taskapp-smoke-")), "smoke.db");

try {
  let store = createStore(dbPath);
  const board = store.createBoard("Smoke Board");
  const column = store.createColumn(board.id, "Todo");
  store.createCard(column.id, { title: "First card", color: "#ff6b6b" });
  store.close();

  // Reopen against the same file to simulate an app restart.
  store = createStore(dbPath);
  const boards = store.listBoards();
  assert.strictEqual(boards.length, 1);
  assert.strictEqual(boards[0].name, "Smoke Board");

  const columns = store.listColumns(boards[0].id);
  assert.strictEqual(columns.length, 1);
  assert.strictEqual(columns[0].name, "Todo");

  const cards = store.listCards(columns[0].id);
  assert.strictEqual(cards.length, 1);
  assert.strictEqual(cards[0].title, "First card");
  assert.strictEqual(cards[0].color, "#ff6b6b");

  store.close();
  console.log("smoke-db: OK — data persisted across store reopen");
} finally {
  fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
}
