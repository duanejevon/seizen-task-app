// Spawned by scripts/smoke-crash.js and SIGKILLed mid-write, to simulate
// an Electron force-quit while a write is in flight.
const { createStore } = require("../electron/db");

async function main() {
  const [dbPath, columnIdArg] = process.argv.slice(2);
  const columnId = Number(columnIdArg);
  const store = createStore(dbPath);

  let i = 0;
  for (;;) {
    store.createCard(columnId, { title: `Card ${i++}` });
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

main();
