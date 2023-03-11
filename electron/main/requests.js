import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch';
import fs from 'fs';


const prisma = new PrismaClient();
export var checkedForUpdate = false;
export var updating = false;


/**
 * This function checks if there is a new version of the game and if there is, it updates the database and assets.
 */
export async function checkForUpdate() {
    const storedVersion = await prisma.setting.findUnique({select: {value: true}, where: {name: "version"}});
    var version = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    version = (await version.json())[0];
    checkedForUpdate = true;
    if (storedVersion != version || true) {
        updating = true;
        prisma.setting.upsert({where: {name: "version"}, create: {name: "version", value: version}, update: {value: version}});
        await update(version);
        updating = false;
    }    
}


/**
 * This function updates the database and assets.
 * @param {string} version the current version of the game.
 */
async function update(version) {
    var champions = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`); 
    champions = Object.values((await champions.json()).data);
     
    for (let i=0; i<champions.length; i++) {
        champions[i] = updateChampion(version, champions[i]);
        break;
    }
    
    await Promise.all(champions);
}


/**
 * This function updates the database and assets for a specific champion.
 * @param {string} version the current version of the game.
 * @param {object} champion the champion to update/store.
 */
async function updateChampion(version, champion) {
    champion = await prisma.champion.upsert({where: {id: champion.id}, create: {id: champion.id, name: champion.name, title: champion.title, lore: champion.lore}});
    
    var storedSkins = await prisma.skin.findMany({select: {number: true}, where: {championId: champion.id}});
    var skins = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champion.id}.json`);
    skins = (await skins.json()).data[champion.name].skins;
    skins = skins.filter(skin => !storedSkins.includes(skin.num));
    
    for (let i=0; i<skins.length; i++) {
        skins[i] = updateSkin(version, champion, skins[i]);
        break;
    }

    await Promise.all(skins);
    return champion;
}

/**
 * This function updates the database and assets for a specific skin.
 * @param {string} version the current version of the game.
 * @param {object} champion the champion the skin belongs to.
 * @param {object} skin the skin to update/store.
 */
async function updateSkin(version, champion, skin) {
    skin = await prisma.skin.upsert({where: {id: skin.id}, create: {id: skin.id, number: skin.num, name: skin.name, championId: champion.id}});
    var skinSplash = await fetch(`http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`);
    // save image here
    return skin;
}

/**
 * This function saves an image to a file.
 * @param {ReadableStream} image the image to save
 * @param {string} filePath the file path to save the image to.
 */
async function saveImage(image, filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });    
    image.pipe(fs.createWriteStream(filePath));
}

// I gotta make sure that the storage folder is on project root directory and not inside prisma.
// The directory will be like this:
// project root
// - storage
// - - database.db
// - - images
// - - - high-res
// - - - thumbnails