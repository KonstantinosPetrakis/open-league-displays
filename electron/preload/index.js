import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('api', {
    getUpdateState: () => ipcRenderer.invoke('getUpdateState'),
    getInformation: () => ipcRenderer.invoke('getInformation'),
    getChampions: () => ipcRenderer.invoke('getChampions'),
    getChampion: (id) => ipcRenderer.invoke('getChampion', id),
    setWallpaper: (skinId) => ipcRenderer.invoke('setWallpaper', skinId)
});
