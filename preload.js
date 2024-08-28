const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadVideo: (data) => ipcRenderer.invoke('download-video', data),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback),
  onDownloadError: (callback) => ipcRenderer.on('download-error', callback),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});