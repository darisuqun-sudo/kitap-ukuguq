const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPdfDialog: () => ipcRenderer.invoke('dialog:openPdf'),
  saveScreenshot: (params) => ipcRenderer.invoke('dialog:saveScreenshot', params),
  copyImageToClipboard: (base64) => ipcRenderer.invoke('clipboard:copyImage', base64),
  isElectron: true,
});
