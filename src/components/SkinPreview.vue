<script setup>
import { ref } from "vue";
import OffCanvas from "../components/ui/OffCanvas.vue";

const props = defineProps({
    skin: {type: Object, required: true},
});


const isFavorite = ref(_isFavorite());


function setWallpaper() {
    window.api.setWallpaper(props.skin.id);
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
        <off-canvas :compact="true" :exit-button="false">
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
    </div>
</template>