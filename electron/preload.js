const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("taskApi", {
  boards: {
    list: () => ipcRenderer.invoke("boards:list"),
    create: (name) => ipcRenderer.invoke("boards:create", name),
    rename: (id, name) => ipcRenderer.invoke("boards:rename", id, name),
    delete: (id) => ipcRenderer.invoke("boards:delete", id),
  },
  columns: {
    list: (boardId) => ipcRenderer.invoke("columns:list", boardId),
    create: (boardId, name) => ipcRenderer.invoke("columns:create", boardId, name),
    rename: (id, name) => ipcRenderer.invoke("columns:rename", id, name),
    delete: (id) => ipcRenderer.invoke("columns:delete", id),
  },
  cards: {
    list: (columnId) => ipcRenderer.invoke("cards:list", columnId),
    create: (columnId, input) => ipcRenderer.invoke("cards:create", columnId, input),
    update: (id, fields) => ipcRenderer.invoke("cards:update", id, fields),
    delete: (id) => ipcRenderer.invoke("cards:delete", id),
  },
});
