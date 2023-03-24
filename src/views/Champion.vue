<script setup>
import { ref } from "vue";
import { useRoute } from 'vue-router'
import SkinPreview from '../components/SkinPreview.vue'

const route = useRoute();
const champion = ref({});

window.api.getChampion(route.params.id).then(champ => champion.value = champ);

</script>

<style scoped>
    fieldset {
        border: 1px solid #715a32ba;
        max-width: 1500px;
        margin: 0 auto;
    }
    legend {
        text-align: center;
    }
    h2 {
        font-size: 2.5rem;
        padding: 0 2rem;
    }
    h3 {
        margin-top: -2rem;
    }
    p {
        padding: 0 2rem;
        font-size: 1.05rem;
        line-height: 1.3;
    }
    #skins {
        display: grid;
        grid-template-columns: repeat(auto-fill, 22rem);  
        align-content: center;
        justify-content: center;
        gap: 1.5rem;
        width: 100%;
        margin: 2rem auto;
    }
</style>

<template>
    <fieldset role="region">
        <legend>
            <h2> {{ champion.name }} </h2>
        </legend>
        <h3> {{ champion.title }} </h3>
        <p> {{ champion.lore }} </p>
        <div id="skins">
            <skin-preview v-for="skin of champion.skins" :key="skin.id" :skin="skin"/>
        </div>
    </fieldset>
</template>