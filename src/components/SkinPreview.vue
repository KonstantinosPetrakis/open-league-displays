<script setup>
import { onUnmounted, ref } from "vue";
import OffCanvas from "../components/ui/OffCanvas.vue";
import Spinner from "../components/ui/Spinner.vue";

const props = defineProps({
    skin: {type: Object, required: true},
});

const isSettingWallpaper = ref(false);
const settingWallpaperFailed = ref(false);
const isFavorite = ref(_isFavorite());

window.api.onUpdateWallpaper(({skinId, msg}) => {
    if (skinId !== props.skin.id) return;
    if (msg === 'timeout' || msg == "fail") settingWallpaperFailed.value = true;
    isSettingWallpaper.value = false;
});

onUnmounted(() => window.api.offUpdateWallpaper());

function setWallpaper() {
    window.api.setWallpaper(props.skin.id);
    isSettingWallpaper.value = true;
}

function addToFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(props.skin);
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
    isFavorite.value = true;
}

function removeFromFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.id === props.skin.id);
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
    isFavorite.value = false;
}

function _isFavorite() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.id === props.skin.id);
}

</script>

<style scoped>
    .skin-preview {
        border: 1px solid #f0e6d214;
        transition: border .6s;
    }
    .skin-preview:hover {
        border: 1px solid #ddbb7850;
        transition: border .6s;
    }
    h4 {
        color: #b7b0a3;
        text-transform: none; 
        margin: .3rem;
        display: -webkit-box; /* Set the display property to a box layout */
        -webkit-line-clamp: 1; /* Limit the text to one line */
        -webkit-box-orient: vertical; /* Set the box orientation to vertical */
        overflow: hidden; /* Hide the overflow */
        text-overflow: ellipsis; /* Add the ellipsis at the end of the visible text */
    }
    img {
        display: block;
        width: 100%;
    }
    .buttons {
        display: flex;
        background-color: #010407;
        z-index: 1;
    }
    .buttons button:first-child {
        border-right: none;
    }
    button {
        all: unset;
        width: 50%;
        padding: .5rem;
        text-align: center;
        text-transform: uppercase;
        font-size: .71rem;
        letter-spacing: .08rem;
        color: #5B5A56;
        border: 1px solid #313135ca;
        transition: color .3s;
    }
    button:hover {
        cursor: pointer;
        color: #c3beb2;
        transition: color .3s;
    }
</style>

<template>
    <div class="skin-preview">
        <off-canvas :compact="true" :exit-button="false" :exit-on-click="true">
            <h4> {{ skin.name }} </h4>
            <img :src="skin.image" :alt="`Image of ${skin.name}`">
            <template #off-canvas>
                <img :src="skin.image" :alt="`Image of ${skin.name}`">
            </template>
        </off-canvas>
        <div class="buttons">
            <button @click="setWallpaper"> Wallpaper </button>
            <button @click="removeFromFavorites" v-if="isFavorite"> Remove from favorites </button>
            <button @click="addToFavorites" v-else> Add to favorites </button>
        </div>
        <off-canvas :active="isSettingWallpaper" :compact="true" :exit-button="false" :exit-on-click="false">
            <template #off-canvas>
                <h3> Work in progress </h3>
                {{ skin.name }} is being downloaded... Please wait.
                <spinner/>
            </template>
        </off-canvas>
        <off-canvas v-model:active="settingWallpaperFailed" :compact="true" :exit-on-click="false" exit-button-text="Sad, but ok">
            <template #off-canvas>
                <h3> Failed to find and set wallpaper </h3>
                <p>
                    Either the skin is unavailable on LOL Wiki or something went wrong. 
                    <br>
                    You could try again, it might work.
                </p>
            </template>
        </off-canvas>
    </div>
</template>