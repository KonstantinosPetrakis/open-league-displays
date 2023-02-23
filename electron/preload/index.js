import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    ping: () => ipcRenderer.invoke('ping')
});