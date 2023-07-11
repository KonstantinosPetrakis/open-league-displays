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
import crypto from "crypto";
const pLimit = require('p-limit');


const prisma = new PrismaClient();
var limit = pLimit(10) // The more concurrent requests, the more likely the requests will fail in slower internet connections.
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
 * A wrapper for fetch that limits the number of concurrent requests to 1.
 * @param {String} url the url to fetch. 
 * @returns {Promise} the fetch promise.
 */
function limitedFetch(url) { return limit(() => fetch(url));}


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
    var version = await limitedFetch("https://ddragon.leagueoflegends.com/api/versions.json");
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
        const skin = await prisma.skin.findUnique({where: {id: skinId}, include: {champion: true}});
        // Known issue with duplicate name skins: Draven Draven, Bard Bard, won't bother for now ...
        skin.name = skin.name.replace(skin.champion.name, "").replace("/", "").replace(":", "").replace(/\s/g, ""); // '/' is for KD/A skin
        const fileName = `${skin.champion.name}_${skin.name}Skin_HD.jpg`;
        const fileNameMD5 = crypto.createHash("md5").update(fileName).digest("hex");
        const url = `https://static.wikia.nocookie.net/leagueoflegends/images/${fileNameMD5[0]}/${fileNameMD5.substring(0, 2)}/${fileName}/revision/latest`;
        const highResImage = await limitedFetch(url);
        if (highResImage.status != 200) 
            return mainWindow.webContents.send("updateWallpaper", {skinId, msg: "fail"});

        const highResJpgImage = sharp(await highResImage.buffer()).jpeg({quality: 100});
        await saveImage(highResJpgImage, `${imageDirectory}/high-res/${skinId}.jpg`);
        // Wait a second to make 100% sure the image is saved.
        setTimeout(() => setDownloadedSkinAsWallpaper(skinId), 1000);
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
    mainWindow.webContents.send("updateWallpaper", {skinId, msg: "success"});
}

/**
 * This function updates the database and assets.
 * @param {string} version the current version of the game.
 */
async function update(version) {
    var champions = await limitedFetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`); 
    champions = Object.values((await champions.json()).data);
    updateState.totalIterations = champions.length;
    
    mainWindow.webContents.send("updateUpdateState", updateState);
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
    champion = await limitedFetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champion.id}.json`); 
    champion = (await champion.json()).data[championId];
    
    if (!await prisma.champion.findUnique({where: {id: championId}})) {
        await prisma.champion.create({data: {id: champion.id, name: champion.name, title: champion.title, lore: champion.lore}});
        var loadingScreenSplashArt = await limitedFetch(`http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`);
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
    var skinSplash = await limitedFetch(`http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.number}.jpg`);
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
