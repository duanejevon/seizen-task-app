const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");
const { createStore } = require("./db");

let store;

const BACKGROUND_SETTING_KEY = "backgroundImage";
const BUILTIN_BACKGROUND_IDS = ["default"];
const BACKGROUND_FILE_FILTERS = [{ name: "Images", extensions: ["jpg", "jpeg", "png", "webp"] }];

function backgroundsDir() {
  return path.join(app.getPath("userData"), "backgrounds");
}

// Settings store a tagged string ("builtin:<id>" or "custom:<filename>") so a
// single TEXT column can represent either kind of selection.
function resolveBackgroundSelection(raw) {
  if (!raw) return null;
  if (raw.startsWith("builtin:")) {
    return { type: "builtin", id: raw.slice("builtin:".length) };
  }
  if (raw.startsWith("custom:")) {
    const filePath = path.join(backgroundsDir(), raw.slice("custom:".length));
    if (!fs.existsSync(filePath)) return null;
    return { type: "custom", url: pathToFileURL(filePath).toString() };
  }
  return null;
}

// Shared by background + board-icon pickers: prompt for an image, copy it
// into a userData subdirectory under a generated name, return both the
// filename (for tagged-string persistence) and a ready-to-use file:// URL.
async function pickAndCopyImage(event, subdir) {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: "Choose an image",
    properties: ["openFile"],
    filters: BACKGROUND_FILE_FILTERS,
  });
  if (canceled || filePaths.length === 0) return null;

  const dir = path.join(app.getPath("userData"), subdir);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${crypto.randomUUID()}${path.extname(filePaths[0])}`;
  const destPath = path.join(dir, filename);
  fs.copyFileSync(filePaths[0], destPath);
  return { filename, url: pathToFileURL(destPath).toString() };
}

function registerIpcHandlers() {
  ipcMain.handle("boards:list", () => store.listBoards());
  ipcMain.handle("boards:create", (_e, name) => store.createBoard(name));
  ipcMain.handle("boards:rename", (_e, id, name) => store.renameBoard(id, name));
  ipcMain.handle("boards:delete", (_e, id) => store.deleteBoard(id));
  ipcMain.handle("boards:setIcon", (_e, id, icon) => store.setBoardIcon(id, icon));
  ipcMain.handle("boards:reorder", (_e, boardIds) => store.reorderBoards(boardIds));
  ipcMain.handle("boards:browseIcon", async (event, id) => {
    const picked = await pickAndCopyImage(event, "board-icons");
    if (!picked) return null;
    return store.setBoardIcon(id, picked.url);
  });

  ipcMain.handle("columns:list", (_e, boardId) => store.listColumns(boardId));
  ipcMain.handle("columns:create", (_e, boardId, name) => store.createColumn(boardId, name));
  ipcMain.handle("columns:rename", (_e, id, name) => store.renameColumn(id, name));
  ipcMain.handle("columns:delete", (_e, id) => store.deleteColumn(id));

  ipcMain.handle("cards:list", (_e, columnId) => store.listCards(columnId));
  ipcMain.handle("cards:listWithDueDates", () => store.listCardsWithDueDates());
  ipcMain.handle("cards:listByBoard", (_e, boardId) => store.listCardsByBoard(boardId));
  ipcMain.handle("cards:create", (_e, columnId, input) => store.createCard(columnId, input));
  ipcMain.handle("cards:update", (_e, id, fields) => store.updateCard(id, fields));
  ipcMain.handle("cards:delete", (_e, id) => store.deleteCard(id));
  ipcMain.handle("cards:reorderColumn", (_e, columnId, cardIds) =>
    store.reorderColumn(columnId, cardIds),
  );

  ipcMain.handle(
    "settings:getBackground",
    () => resolveBackgroundSelection(store.getSetting(BACKGROUND_SETTING_KEY)) ?? {
      type: "builtin",
      id: "default",
    },
  );

  ipcMain.handle("settings:setBuiltinBackground", (_e, id) => {
    if (!BUILTIN_BACKGROUND_IDS.includes(id)) {
      throw new Error(`Unknown built-in background: ${id}`);
    }
    store.setSetting(BACKGROUND_SETTING_KEY, `builtin:${id}`);
    return { type: "builtin", id };
  });

  ipcMain.handle("settings:browseForBackground", async (event) => {
    const picked = await pickAndCopyImage(event, "backgrounds");
    if (!picked) return null;
    store.setSetting(BACKGROUND_SETTING_KEY, `custom:${picked.filename}`);
    return { type: "custom", url: picked.url };
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "..", "build", "icon.png"),
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
  // Replaced by the in-app hamburger menu (see AppMenu.tsx) to match the
  // Windows 11/Fluent look this app is going for.
  Menu.setApplicationMenu(null);

  const dbPath = path.join(app.getPath("userData"), "dunit.db");
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
