import { app, BrowserWindow } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import { checkForUpdate, updateState } from "./requests.js";
import { initialize } from "./api.js";
import isDev from "electron-is-dev";


process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST;
process.env.PRODUCTION = !isDev;
// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow() {
    win = new BrowserWindow({
        title: 'Open League Displays',
        icon: join(process.env.PUBLIC, 'favicon.ico'),
        webPreferences: {preload},
        autoHideMenuBar: true,
    });

    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
        win.loadURL(url)
        // Open devTool if the app is not packaged
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(indexHtml);
    }

}

initialize({updateState}); 
app.whenReady().then(createWindow);
// checkForUpdate();

app.on('window-all-closed', () => {
    win = null;
    app.quit();
});
