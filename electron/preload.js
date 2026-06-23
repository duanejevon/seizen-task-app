const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("taskApi", {
  boards: {
    list: () => ipcRenderer.invoke("boards:list"),
    create: (name) => ipcRenderer.invoke("boards:create", name),
    rename: (id, name) => ipcRenderer.invoke("boards:rename", id, name),
    delete: (id) => ipcRenderer.invoke("boards:delete", id),
    setIcon: (id, icon) => ipcRenderer.invoke("boards:setIcon", id, icon),
    browseIcon: (id) => ipcRenderer.invoke("boards:browseIcon", id),
    reorder: (boardIds) => ipcRenderer.invoke("boards:reorder", boardIds),
  },
  columns: {
    list: (boardId) => ipcRenderer.invoke("columns:list", boardId),
    create: (boardId, name) => ipcRenderer.invoke("columns:create", boardId, name),
    rename: (id, name) => ipcRenderer.invoke("columns:rename", id, name),
    delete: (id) => ipcRenderer.invoke("columns:delete", id),
    reorder: (columnIds) => ipcRenderer.invoke("columns:reorder", columnIds),
  },
  cards: {
    list: (columnId) => ipcRenderer.invoke("cards:list", columnId),
    listWithDueDates: () => ipcRenderer.invoke("cards:listWithDueDates"),
    listByBoard: (boardId) => ipcRenderer.invoke("cards:listByBoard", boardId),
    create: (columnId, input) => ipcRenderer.invoke("cards:create", columnId, input),
    update: (id, fields) => ipcRenderer.invoke("cards:update", id, fields),
    delete: (id) => ipcRenderer.invoke("cards:delete", id),
    reorderColumn: (columnId, cardIds) =>
      ipcRenderer.invoke("cards:reorderColumn", columnId, cardIds),
  },
  settings: {
    getBackground: () => ipcRenderer.invoke("settings:getBackground"),
    setBuiltinBackground: (id) => ipcRenderer.invoke("settings:setBuiltinBackground", id),
    browseForBackground: () => ipcRenderer.invoke("settings:browseForBackground"),
  },
});
