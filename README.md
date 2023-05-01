# Open League Displays
## What is Open League Displays?
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Open League Displays is an open source, cross platform application for downloading and
setting high resolution wallpapers to your desktop. 


https://user-images.githubusercontent.com/69787592/235344286-61ac2b84-1c0b-463e-b369-7768ce4c8553.mp4


The whole idea and design came from the [Riot Game's League Displays](https://displays.riotgames.com/en-us/) which is an application that runs only under Windows and isn't maintained anymore.

I was really enjoying Riot's League Displays but I was also getting frustrated over the fact that I couldn't set my wallpaper to newly released skins or on my Linux machine. So I decided to create this project.

## How to download and install it?
Go to the releases page and download the latest version for your operating system. Because I don't own a mac, I haven't built it and test it there, if you known how to use a shell and are familiar with node, you can build it yourself (see below).


## How it works? 
- It gets updated about new skins from Riot's DataDragon API automatically.
- It downloads low resolution images from Riot's DataDragon API (CDN) used for thumbnails in the UI.
- It downloads high resolution images from [League of Legends Fandom Wiki](https://leagueoflegends.fandom.com/wiki/League_of_Legends_Wiki) used for the wallpapers.


## How to run it / build it from source?
```shell
git clone git@github.com:KonstantinosPetrakis/open-league-displays.git
cd open-league-displays
npm install
npm run reset # This will delete all stored data if any, and push migrations to the database
# npm run reset-windows Equivalent to npm run reset but for windows
npm run dev 
npm run build 
# npm run build-windows Equivalent to npm run build but for windows
```

## Disclaimers
This project is not affiliated with Riot Games in any way. All the images and assets used in this project are property of Riot Games.

## Known issues
- The application doesn't work for skins with repeated champion names (Draven Draven, Bard Bard, ...) the solution is trivial but I am too lazy to implement it right now.
- Data loss on thumbnails or incomplete download/initial update could happen on slow connections. This most likely happens because the concurrent connections are getting timed out from the DataDragon API Server.