import { contextBridge, ipcRenderer } from 'electron';

ipcRenderer.setMaxListeners(50); // max number of skins - listeners

contextBridge.exposeInMainWorld('api', {
    // From main to renderer
    getInformation: () => ipcRenderer.invoke('getInformation'),
    getChampions: () => ipcRenderer.invoke('getChampions'),
    getChampion: (id) => ipcRenderer.invoke('getChampion', id),
    setWallpaper: (skinId) => ipcRenderer.invoke('setWallpaper', skinId),
    sendWallpaperURL: (wallpaperURL) => ipcRenderer.invoke('sendWallpaperURL', wallpaperURL),
    // From renderer to main
    onUpdateWallpaper: (callback) => ipcRenderer.on('updateWallpaper', (event, args) => callback(args)),
    onUpdateUpdateState: (callback) => ipcRenderer.on('updateUpdateState', (event, args) => callback(args)),
});
