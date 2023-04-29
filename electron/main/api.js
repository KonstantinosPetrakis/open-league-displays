const fastFolderSizeSync = require('fast-folder-size/sync')
const fs = require("fs");
const path = require("path");
import { ipcMain, ipcRenderer } from 'electron';
import { PrismaClient } from "@prisma/client";
import * as requests from "./requests";


// Initialization and global variables
const prisma = new PrismaClient();
var win;

export function initialize(data) {
    win = data.win;
    requests.initialize(win);
}

// Exposed functions - API
ipcMain.handle("checkForUpdate", () => requests.checkForUpdate());

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

ipcMain.handle("getCacheSize", async () => {
    const filePath = `${requests.imageDirectory}/high-res`;
    return (fastFolderSizeSync(filePath) / 1000000).toFixed(2);
});

ipcMain.handle("clearCache", async () => {
    const filePath = `${requests.imageDirectory}/high-res`;
    fs.readdir(filePath, (_, files) => {
        for (const file of files) if (file.endsWith(".jpg")) fs.unlinkSync(path.join(filePath, file));
    });
});
