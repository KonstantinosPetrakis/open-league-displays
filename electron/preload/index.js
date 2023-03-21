import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('api', {
    getUpdateState: () => ipcRenderer.invoke('getUpdateState'),
    getCurrentVersion: () => ipcRenderer.invoke('getCurrentVersion'),
    getChampions: () => ipcRenderer.invoke('getChampions')
});
