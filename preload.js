const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

toggleMiniMode: () => ipcRenderer.send("toggle-mini-mode")

});
