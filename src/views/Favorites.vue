<script setup>
import SkinPreview from "../components/SkinPreview.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function removeAllFavorites() {
    localStorage.removeItem('favorites');
    favorites.splice(0, favorites.length);
    router.go(router.currentRoute);
}

</script>

<style scoped>
    #favorites {
        display: grid;
        grid-template-columns: repeat(auto-fill, 22rem);  
        align-content: center;
        justify-content: center;
        gap: 1.5rem;
        width: 100%;
        margin: 2rem auto;
    }
    button {
        grid-column: 1 / -1;
        width: 22rem;
    }
</style>

<template>
    <h1> Favorites </h1>
    <p v-if="!favorites.length">
        You don't have any favorites yet.
    </p>
    <div v-else id="favorites">
        <button @click="removeAllFavorites"> Remove all favorites </button>
        <skin-preview v-for="skin of favorites" :key="skin.id" :skin="skin"/>
    </div>
</template>