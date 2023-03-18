import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('api', {
    getUpdateState: () => ipcRenderer.invoke('getUpdateState')
});
