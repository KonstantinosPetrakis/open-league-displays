import { ipcMain } from 'electron';


function ping() {
    return 'pong';
}

ipcMain.handle('ping', () => ping());