import { ipcMain } from 'electron';
import { PrismaClient } from "@prisma/client";

// Initizalization and global variables
const prisma = new PrismaClient();
var updateState;

export function initialize(data) {
    updateState = data.updateState;
}

// Exposed functions - API
ipcMain.handle('getUpdateState', () => {
    return JSON.stringify(updateState);
});

ipcMain.handle("getCurrentVersion", async () => {
    return (await prisma.setting.findUnique({select: {value: true}, where: {name: "version"}})).value;
});

ipcMain.handle("getChampions", async () => {
    var champs =  await prisma.champion.findMany({orderBy: {id: "asc"}});
    champs.forEach(champ => champ.image = `/src/assets/images/loading-screen/${champ.id}.jpg`);
    return champs;
});
