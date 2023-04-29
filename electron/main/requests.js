/**
 * This module handles the update process by making requests to the Riot (DataDragon) API.
 * It also handles the download of the high resolution splash arts from the League of Legends fandom wiki
 * and the conversion of the .webp images to .jpg as well as setting them as the wallpaper.
 */


const { exec } = require('child_process');
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { BrowserWindow, ipcMain } from "electron";
import sharp from "sharp";
import { dirname, join } from 'path';
import fs from 'fs';
import isDev from "electron-is-dev";


const prisma = new PrismaClient();
var updateState = {}; // This object is used to send the update state to the renderer process.
var mainWindow; // the main window, it will be initialized in the initialize function
export const imageDirectory = isDev ? join(__dirname, "../../public/images") : join(dirname(process.execPath), "resources/app/dist/images");

/**
 * This function initializes the requests module.
 * @param {Object} win the main window, which will be used to communicate with the renderer process.
 */
export function initialize(win) {
    mainWindow = win;
}


/**
 * This function resets the update state object.
 */
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
 * Moreover it changes the file extension to .jpg from .webp and sets it as the wallpaper.
 * @param {Number} skinId the id of the skin.
 */
export async function downloadAndSetWallpaper(skinId) {
    if (!fs.existsSync(`${imageDirectory}/high-res/${skinId}.jpg`)) {
        // Create the URL
        const skin = await prisma.skin.findUnique({where: {id: skinId}, include: {champion: true}});
        // Known issue with duplicate name skins: Draven Draven, Bard Bard, won't bother for now ...
        skin.name = skin.name.replace(skin.champion.name, "").replace("/", "").replace(":", "").replace(/\s/g, ""); // '/' is for KD/A skin
        const url = `https://leagueoflegends.fandom.com/wiki/${skin.champion.name}/LoL/Cosmetics?file=${skin.champion.name}_${skin.name}Skin_HD.jpg`;

        // Handler for the wallpaper URL (see below)
        // When the high-res wallpaper URL is received, destroy the window and download the image,
        // afterward convert it to .jpg and save it.
        // P.S: Everything is done like this because the fandom wiki uses js to render the page and 
        // can't be scraped with node-fetch.
        ipcMain.removeHandler("sendWallpaperURL"); // Remove the old handler if there is one (this could happen if the user clicks on another skin before the previous one is downloaded)
        ipcMain.handle("sendWallpaperURL", async (event, url) => {
            win.destroy();
            ipcMain.removeHandler("sendWallpaperURL");
            if (url == "timeout") mainWindow.webContents.send("updateWallpaper", {skinId, msg: "timeout"});
            else if (url == "fail") mainWindow.webContents.send("updateWallpaper", {skinId, msg: "fail"});
            else {
                const highResImage = await fetch(url);
                const highResJpgImage = sharp(await highResImage.buffer()).jpeg({quality: 100});
                await saveImage(highResJpgImage, `${imageDirectory}/high-res/${skinId}.jpg`);
                // Wait a second to make 100% sure the image is saved.
                setTimeout(() => setDownloadedSkinAsWallpaper(skinId), 1000);
            }
        });

        // Create a new window for scraping the js-based fandom wiki and make it send
        const win = new BrowserWindow({show: false, webPreferences: {preload: join(__dirname, '../preload/index.js')}});
        win.loadURL(url);
        win.webContents.on("dom-ready", () => {
            win.webContents.executeJavaScript(`
                function waitForElm(selector) {
                    return new Promise(resolve => {
                        // If the element is already in the DOM, resolve immediately
                        if (document.querySelector(selector)) {
                            return resolve(document.querySelector(selector));
                        }

                        // Else wait for it to appear and then resolve
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
                // Send successful message
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
    else setDownloadedSkinAsWallpaper(skinId);
}


/**
 * This function sets the downloaded skin as the wallpaper and sends a message to the renderer process.
 * It wraps the wallpaper module to hotfix and make it work with new gnome versions.
 * @param {Number} skinId the id of the skin. 
 */
async function setDownloadedSkinAsWallpaper(skinId) {
    const {setWallpaper} = await import("wallpaper");
    const path = `${imageDirectory}/high-res/${skinId}.jpg`;
    setWallpaper(path);
    exec(`gsettings set org.gnome.desktop.background picture-uri "file://${path}"`);
    exec(`gsettings set org.gnome.desktop.background picture-uri-dark "file://${path}"`);
    
    console.log(path);
    mainWindow.webContents.send("updateWallpaper", {skinId, msg: "success"});
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
        await saveImage(loadingScreenSplashArt.body, `${imageDirectory}/loading-screen/${champion.id}.jpg`); 
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
    await saveImage(skinSplash.body, `${imageDirectory}/thumbnails/${champion.id}/${skin.number}.jpg`);
    return skin;
}

/**
 * This function saves an image to a file.
 * @param {ReadableStream} image the image to save.
 * @param {string} filePath the file path to save the image to (including the file name).
 */
async function saveImage(image, filePath) {
    const directoryName = dirname(filePath);
    if (!fs.existsSync(directoryName)) fs.mkdirSync(directoryName, { recursive: true });    
    await image.pipe(fs.createWriteStream(filePath));
}
