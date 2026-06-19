// Simulates an Electron force-quit while the storage layer is actively
// writing: spawns a worker that writes cards in a loop, SIGKILLs it
// mid-stream, then verifies the on-disk SQLite file is still valid and
// every persisted row is fully formed (no partial/corrupt writes).
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { createStore } = require("../electron/db");

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "taskapp-crash-"));
  const dbPath = path.join(tmpDir, "crash.db");
  const workerPath = path.join(__dirname, "_crash-worker.js");

  try {
    let store = createStore(dbPath);
    const board = store.createBoard("Crash Board");
    const column = store.createColumn(board.id, "Todo");
    store.close();

    const child = spawn(process.execPath, [workerPath, dbPath, String(column.id)], {
      stdio: "ignore",
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    child.kill("SIGKILL");
    await new Promise((resolve) => child.on("exit", resolve));

    store = createStore(dbPath);
    const integrity = store.integrityCheck();
    assert.deepStrictEqual(integrity, [{ integrity_check: "ok" }]);

    const cards = store.listCards(column.id);
    assert.ok(cards.length > 0, "expected at least one card to have been written before the kill");

    const positions = cards.map((c) => c.position).sort((a, b) => a - b);
    for (let i = 0; i < positions.length; i++) {
      assert.strictEqual(positions[i], i, "expected contiguous positions — found a gap or duplicate");
    }
    for (const card of cards) {
      assert.ok(/^Card \d+$/.test(card.title), `expected a fully-written title, got ${JSON.stringify(card.title)}`);
    }

    store.close();
    console.log(
      `smoke-crash: OK — SIGKILL mid-write left ${cards.length} fully-formed card(s), integrity check passed`,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
