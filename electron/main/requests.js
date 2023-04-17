/**
 * This module handles the update process by making requests to the Riot API.
 * It also handles the download of the high resolution splash arts from the League of Legends fandom wiki.
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { BrowserWindow, ipcMain } from "electron";
import sharp from "sharp";
import { dirname, join } from 'path';
import fs from 'fs';


const prisma = new PrismaClient();
var mainWindow; // the main window

export var updateState = {};

export function initialize(win) {
    mainWindow = win;
}

function resetUpdateState() {
    updateState = {
        checkedForUpdate: false,
        updating: false,
        currentIterations: 0,
        totalIterations: 0
    }
}

/**
 * This function checks if there is a new version of the game and if there is, it updates the database and assets.
 */
export async function checkForUpdate() {
    const storedVersion = await prisma.setting.findUnique({select: {value: true}, where: {name: "version"}});
    var version = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    version = (await version.json())[0];
    resetUpdateState();
    updateState.checkedForUpdate = true;
    if (storedVersion != version) {
        updateState.updating = true;
        var versionPair = {name: "version", value: version} 
        await prisma.setting.upsert({where: {name: "version"}, create: versionPair, update: versionPair});
        await update(version);
        updateState.updating = false;
    }
    mainWindow.webContents.send("updateUpdateState", updateState);    
}

/**
 * This function downloads a high resolution splash art for a specific skin.
 * Moreover it changes the file extension to .jpg from .webp.
 * @param {Number} skinId 
 */
export async function downloadAndSetWallpaper(skinId) {
    if (!fileExists(`public/images/high-res/${skinId}.jpg`)) {
        // Create the URL
        const skin = await prisma.skin.findUnique({where: {id: skinId}, include: {champion: true}});
        // Known issue with duplicate name skins: Draven Draven, Bard Bard, ...
        skin.name = skin.name.replace(skin.champion.name, "").replace("/", "").replace(":", "").replace(/\s/g, ""); // '/' is for KD/A skin
        const url = `https://leagueoflegends.fandom.com/wiki/${skin.champion.name}/LoL/Cosmetics?file=${skin.champion.name}_${skin.name}Skin_HD.jpg`;

        // Handler for the wallpaper URL (see below)
        // When the high-res wallpaper URL is received, destroy the window and download the image,
        // afterward convert it to .jpg and save it.
        ipcMain.removeHandler("sendWallpaperURL"); // Remove the old handler if there is one.
        ipcMain.handle("sendWallpaperURL", async (event, url) => {
            win.destroy();
            ipcMain.removeHandler("sendWallpaperURL");
            if (url == "timeout") mainWindow.webContents.send("updateWallpaper", {skinId, msg: "timeout"});
            else if (url == "fail") mainWindow.webContents.send("updateWallpaper", {skinId, msg: "fail"});
            else {
                const highResImage = await fetch(url);
                const highResJpgImage = sharp(await highResImage.buffer()).jpeg({quality: 100});
                await saveImage(highResJpgImage, `public/images/high-res/${skinId}.jpg`);
                import("wallpaper").then(async ({setWallpaper}) => {
                    // Wait a second to make sure the image is saved.
                    setTimeout(() => {
                        setWallpaper(getCorrectFilePath(`public/images/high-res/${skinId}.jpg`));
                        mainWindow.webContents.send("updateWallpaper", {skinId, msg: "success"});
                    }, 1000);
                });
            }
        });

        // Create a new window for scraping the js-based fandom wiki and make it send
        // the high-res wallpaper URL to the handler below.
        const win = new BrowserWindow({show: false, webPreferences: {preload: join(__dirname, '../preload/index.js')}});
        win.loadURL(url);
        win.webContents.on("dom-ready", () => {
            win.webContents.executeJavaScript(`
                function waitForElm(selector) {
                    return new Promise(resolve => {
                        if (document.querySelector(selector)) {
                            return resolve(document.querySelector(selector));
                        }
                
                        const observer = new MutationObserver(mutations => {
                            if (document.querySelector(selector)) {
                                resolve(document.querySelector(selector));
                                observer.disconnect();
                            }
                        });
                
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                    });
                }
                // Send succesfully message
                waitForElm('.see-full-size-link').then((elm) => {
                    window.api.sendWallpaperURL(elm.href);
                });
                // Send fail message
                waitForElm('.modalContent > h1').then((elm) => {
                    window.api.sendWallpaperURL("fail");
                });
                // Send timeout message
                setTimeout(() => window.api.sendWallpaperURL("timeout"), 10000);
            `);
        });
    }
    else {
        import("wallpaper").then(async ({setWallpaper}) => {
            await setWallpaper(getCorrectFilePath(`public/images/high-res/${skinId}.jpg`));
            mainWindow.webContents.send("updateWallpaper", {skinId, msg: "success"});
        });
    }
}

/**
 * This function updates the database and assets.
 * @param {string} version the current version of the game.
 */
async function update(version) {
    var champions = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`); 
    champions = Object.values((await champions.json()).data);
    updateState.totalIterations = champions.length;
    
    for (let i=0; i<champions.length; i++) champions[i] = updateChampion(version, champions[i]);
    await Promise.all(champions);
}


/**
 * This function updates the database and assets for a specific champion.
 * @param {string} version the current version of the game.
 * @param {object} champion the champion to update/store as returned by the Riot API.
 * @returns {object} the updated champion as stored in the database.
 */
async function updateChampion(version, champion) {
    var championId = champion.id;
    champion = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champion.id}.json`); 
    champion = (await champion.json()).data[championId];
    
    if (!await prisma.champion.findUnique({where: {id: championId}})) {
        await prisma.champion.create({data: {id: champion.id, name: champion.name, title: champion.title, lore: champion.lore}});
        var loadingScreenSplashArt = await fetch(`http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`);
        await saveImage(loadingScreenSplashArt.body, `public/images/loading-screen/${champion.id}.jpg`); 
    }
        
    var storedSkins = await prisma.skin.findMany({select: {number: true}, where: {championId: champion.id}});
    storedSkins = storedSkins.map(skin => skin.number);
    var skins = champion.skins.filter(skin => !storedSkins.includes(skin.num));

    for (let i=0; i<skins.length; i++) skins[i] = updateSkin(champion, skins[i]);
    await Promise.all(skins);

    updateState.currentIterations++;
    mainWindow.webContents.send("updateUpdateState", updateState);
    return champion;
}

/**
 * This function updates the database and assets for a specific skin.
 * @param {object} champion the champion the skin belongs to.
 * @param {object} skin the skin to update/store as returned by the Riot API.
 * @returns {object} the updated skin as stored in the database.
 */
async function updateSkin(champion, skin) {
    skin.name = skin.name == "default" ? `Original ${champion.name}` : skin.name;
    skin = {id: +skin.id, number: skin.num, name: skin.name, championId: champion.id};
    skin = await prisma.skin.upsert({where: {id: skin.id}, create: skin, update: skin});
    var skinSplash = await fetch(`http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.number}.jpg`);
    await saveImage(skinSplash.body, `public/images/thumbnails/${champion.id}/${skin.number}.jpg`);
    return skin;
}

/**
 * This function saves an image to a file.
 * @param {ReadableStream} image the image to save.
 * @param {string} filePath the file path to save the image to (including the file name). The filepath should be such that everything works well in development, the function takes care of writing to different directories in production. 
 */
async function saveImage(image, filePath) {
    filePath = getCorrectFilePath(filePath);
    const directoryName = dirname(getCorrectFilePath(filePath));
    if (!fs.existsSync(directoryName)) fs.mkdirSync(directoryName, { recursive: true });    
    await image.pipe(fs.createWriteStream(filePath));
}

/**
 * This function checks if a file exists.
 * @param {string} filePath the file path to check (including the file name). The filepath should be such that everything works well in development, the function takes care of writing to different directories in production.
 */
function fileExists(filePath) {
    return fs.existsSync(getCorrectFilePath(filePath));
}

/**
 * This function returns the correct file path for the current environment.
 * @param {string} filePath the file path to check (including the file name). The filepath should be such that everything works well in development, the function takes care of writing to different directories in production.
 * @returns the correct file path for the current environment.
 */
export function getCorrectFilePath(filePath) {
    if (process.env.PRODUCTION == "true") filePath = filePath.replace("public", "resources/app/dist");
    return filePath;
}
