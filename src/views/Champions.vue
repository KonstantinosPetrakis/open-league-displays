<script setup>
import { ref } from "vue";
import ChampionPreview from "../components/ChampionPreview.vue";

const champions = ref();

window.api.getChampions().then(champs => champions.value = champs);

</script>

<style scoped>
    #champions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
</style>

<template>
    <h1> Champions </h1>
    <p>
        Todo: 
        <ul>
            <li> 
                Fix the names of the characters, add an extra column 'name' instead of id in key
                column of the database.
            </li>
            <li>
                Add a search bar to filter the champions by name.
            </li>
            <li>
                ...
            </li>
        </ul>
    </p>
    <div id="champions">
        <champion-preview v-for="champion of champions" :key="champion.id" :champion="champion"/>
    </div>
</template>