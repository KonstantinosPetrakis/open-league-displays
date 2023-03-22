<script setup>
import { ref, computed } from "vue";
import ChampionPreview from "../components/ChampionPreview.vue";

const champions = ref([]);
const championSearch = ref("");

const filteredChampions = computed(() => 
    champions.value.filter(champion => champion.name.toLowerCase().
        startsWith(championSearch.value.toLowerCase())));


window.api.getChampions().then(champs => champions.value = champs);


</script>

<style scoped>
    #champions {
        display: grid;
        grid-template-columns: repeat(auto-fill, 8rem);  
        align-content: center;
        justify-content: center;
        gap: 1.5rem;
        max-width: 1500px;
        margin: 0 auto;
    }
    #search-container {
        grid-column: 1 / -1;
    }
    input {
        all: unset;
        display: block;
        width: 20rem;
    }
</style>

<template>
    <h1> Champions </h1>
    <div id="champions">
        <div id="search-container">
            <input type="text" @input="event => championSearch = event.target.value" placeholder="SEARCH FOR A CHAMPION">
        </div>
        <champion-preview v-for="champion of filteredChampions" :key="champion.id" :champion="champion"/>
    </div>
</template>