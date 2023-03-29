/**
 * This module handles the update process by making requests to the Riot API.
 */


import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { dirname } from 'path';
import fs from 'fs';


const prisma = new PrismaClient();

export var updateState = {
    checkedForUpdate: false,
    updating: false,
    currentIterations: 0,
    totalIterations: 0
}


/**
 * This function checks if there is a new version of the game and if there is, it updates the database and assets.
 */
export async function checkForUpdate() {
    const storedVersion = await prisma.setting.findUnique({select: {value: true}, where: {name: "version"}});
    var version = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    version = (await version.json())[0];
    updateState.checkedForUpdate = true;
    if (storedVersion != version || true) {
        updateState.updating = true;
        var versionPair = {name: "version", value: version} 
        await prisma.setting.upsert({where: {name: "version"}, create: versionPair, update: versionPair});
        await update(version);
        updateState.updating = false;
    }    
}

/**
 * This function downloads a high resolution splash art for a specific skin.
 * Moreover it changes the file extension to .jpg from .webp.
 * @param {Number} skinId 
 */
export async function downloadHighResSkin(skinId) {
    if (fileExists(`public/images/high-res/${skinId}.jpg`)) return;
    const skin = await prisma.skin.findUnique({where: {id: skinId}, include: {champion: true}});
    skin.name = skin.name.replace(skin.champion.name, "").replace("/", "").replace(/\s/g, ""); // '/' is for KD/A skin
    const url = `https://leagueoflegends.fandom.com/wiki/${skin.champion.name}/LoL/Cosmetics?file=${skin.champion.name}_${skin.name}Skin_HD.jpg`;

    // This page is rendered with JavaScript, so we need to use puppeteer to get the image URL.
    // The following package allows us to use puppeteer in an electron app without an extra
    // electron executable.
    // https://www.npmjs.com/package/puppeteer-in-electron
}

/**
 * This function updates the database and assets.
 * @param {string} version the current version of the game.
 */
async function update(version) {
    var champions = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`); 
    champions = Object.values((await champions.json()).data);
    updateState.totalIterations = champions.length;
    
    for (let i=0; i<champions.length; i++) {
        champions[i] = updateChampion(version, champions[i]);
    }

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
        saveImage(loadingScreenSplashArt.body, `public/images/loading-screen/${champion.id}.jpg`); 
    }
        
    var storedSkins = await prisma.skin.findMany({select: {number: true}, where: {championId: champion.id}});
    storedSkins = storedSkins.map(skin => skin.number);
    var skins = champion.skins.filter(skin => !storedSkins.includes(skin.num));

    for (let i=0; i<skins.length; i++) skins[i] = updateSkin(champion, skins[i]);
    await Promise.all(skins);

    updateState.currentIterations++;
    console.log(updateState.currentIterations + "/" + updateState.totalIterations)
    return champion; //153
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
    saveImage(skinSplash.body, `public/images/thumbnails/${champion.id}/${skin.number}.jpg`);
    return skin;
}

/**
 * This function saves an image to a file.
 * @param {ReadableStream} image the image to save.
 * @param {string} filePath the file path to save the image to (including the file name). The filepath should be such that everything works well in development, the function takes care of writing to different directories in production. 
 */
async function saveImage(image, filePath) {
    if (process.env.PRODUCTION == "true") filePath = filePath.replace("public", "resources/app/dist");
    const directoryName = dirname(filePath);
    if (!fs.existsSync(directoryName)) fs.mkdirSync(directoryName, { recursive: true });    
    image.pipe(fs.createWriteStream(filePath));
}

/**
 * This function checks if a file exists.
 * @param {string} filePath the file path to check (including the file name). The filepath should be such that everything works well in development, the function takes care of writing to different directories in production.
 */
function fileExists(filePath) {
    if (process.env.PRODUCTION == "true") filePath = filePath.replace("public", "resources/app/dist");
    return fs.existsSync(filePath);
}
