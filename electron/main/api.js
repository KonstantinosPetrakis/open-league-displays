import { ipcMain } from 'electron';


// Globals
var updateState;

export function initialize(data) {
    updateState = data.updateState;
    setTimeout(() => {
        updateState.currentIterations = updateState.currentIterations < updateState.totalIterations
            ? updateState.totalIterations : updateState.currentIterations + 1;
    }, 200);
}


// Exposed functions - API
ipcMain.handle('getUpdateState', () => {
    return JSON.stringify(updateState);
});

