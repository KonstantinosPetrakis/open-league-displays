import { ipcMain } from 'electron';
import { PrismaClient } from "@prisma/client";
import * as requests from "./requests";

// Initizalization and global variables
const prisma = new PrismaClient();
var updateState;
var win;

export function initialize(data) {
    win = data.win;
    updateState = data.updateState;
    requests.initialize(win);
}

// Exposed functions - API
ipcMain.handle('getUpdateState', () => {
    return JSON.stringify(updateState);
});

ipcMain.handle("getInformation", async () => {
    const version = (await prisma.setting.findUnique({select: {value: true}, where: {name: "version"}})).value;
    const championsCount = (await prisma.champion.count());
    const skinsCount = (await prisma.skin.count());
    return {version, championsCount, skinsCount};
});

ipcMain.handle("getChampions", async () => {
    var champs =  await prisma.champion.findMany({orderBy: {id: "asc"}});
    champs.forEach(champ => champ.image = `./images/loading-screen/${champ.id}.jpg`);
    return champs;
});

ipcMain.handle("getChampion", async (event, id) => {
    var champ = await prisma.champion.findUnique({where: {id: id}, include: {skins: true}});
    champ.skins.forEach(skin => skin.image = `./images/thumbnails/${champ.id}/${skin.number}.jpg`);
    return champ;
});

ipcMain.handle("setWallpaper", async (event, skinId) => {
    await requests.downloadAndSetWallpaper(skinId);
});