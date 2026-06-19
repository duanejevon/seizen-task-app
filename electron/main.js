const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { createStore } = require("./db");

let store;

function registerIpcHandlers() {
  ipcMain.handle("boards:list", () => store.listBoards());
  ipcMain.handle("boards:create", (_e, name) => store.createBoard(name));
  ipcMain.handle("boards:rename", (_e, id, name) => store.renameBoard(id, name));
  ipcMain.handle("boards:delete", (_e, id) => store.deleteBoard(id));

  ipcMain.handle("columns:list", (_e, boardId) => store.listColumns(boardId));
  ipcMain.handle("columns:create", (_e, boardId, name) => store.createColumn(boardId, name));
  ipcMain.handle("columns:rename", (_e, id, name) => store.renameColumn(id, name));
  ipcMain.handle("columns:delete", (_e, id) => store.deleteColumn(id));

  ipcMain.handle("cards:list", (_e, columnId) => store.listCards(columnId));
  ipcMain.handle("cards:listByBoard", (_e, boardId) => store.listCardsByBoard(boardId));
  ipcMain.handle("cards:create", (_e, columnId, input) => store.createCard(columnId, input));
  ipcMain.handle("cards:update", (_e, id, fields) => store.updateCard(id, fields));
  ipcMain.handle("cards:delete", (_e, id) => store.deleteCard(id));
  ipcMain.handle("cards:reorderColumn", (_e, columnId, cardIds) =>
    store.reorderColumn(columnId, cardIds),
  );
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath("userData"), "taskapp.db");
  store = createStore(dbPath);
  registerIpcHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  store?.close();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
