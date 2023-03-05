import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch';


const prisma = new PrismaClient()


export async function checkForUpdate() {
    try {
        const savedVersion = await prisma.setting.findUnique({select: {value: true}, where: {name: "version"}});
        var version = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        version = (await version.json())[0];
        if (savedVersion != version) {
            await prisma.setting.upsert({where: {name: "version"}, create: {name: "version", value: version}, update: {value: version}});
        }
    }
    catch (e) {
        console.log("Could not check for update. Error: " + e);
    }
}

// If update is available, it should download thumbnail for every champion and skin that's new.
// Initially it will download 1500 skins * 200kb each = 300mb
// First it will detect the number of skins it has to download and then download them one by one.
// So we can have a progress bar.

// In order to find the new assets to download we have to make one request for each champions, that's 170 requests.