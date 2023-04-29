import { contextBridge, ipcRenderer } from 'electron';

ipcRenderer.setMaxListeners(50); // max number of skins - listeners

contextBridge.exposeInMainWorld('api', {
    getInformation: () => ipcRenderer.invoke('getInformation'),
    getChampions: () => ipcRenderer.invoke('getChampions'),
    getChampion: (id) => ipcRenderer.invoke('getChampion', id),
    setWallpaper: (skinId) => ipcRenderer.invoke('setWallpaper', skinId),
    sendWallpaperURL: (wallpaperURL) => ipcRenderer.invoke('sendWallpaperURL', wallpaperURL),
    checkForUpdate: () => ipcRenderer.invoke('checkForUpdate'),
    
    onUpdateWallpaper: (callback) => ipcRenderer.on('updateWallpaper', (event, args) => callback(args)),
    offUpdateWallpaper: () => ipcRenderer.removeAllListeners('updateWallpaper'), 
    
    onUpdateUpdateState: (callback) => ipcRenderer.on('updateUpdateState', (event, args) => callback(args)),
    offUpdateUpdateState: () => ipcRenderer.removeAllListeners('updateUpdateState'),
    
    getCacheSize: () => ipcRenderer.invoke('getCacheSize'),
    clearCache: () => ipcRenderer.invoke('clearCache'),
});
