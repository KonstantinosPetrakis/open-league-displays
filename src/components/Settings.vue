<script setup>
import { ref } from "vue";
import OffCanvas from "./ui/OffCanvas.vue";
import SettingIcon from "./svgs/SettingIcon.vue";
import SweepIcon from "./svgs/SweepIcon.vue";
import ReloadIcon from "./svgs/ReloadIcon.vue";


function refreshCache() {
    window.api.getCacheSize().then(size => cacheSize.value = size);
}

const information = ref({});
const cacheSize = ref(0);
window.api.getInformation().then(info => information.value = info);
refreshCache();
</script>

<style scoped>
table {
    text-align: left;
    border: 1px solid;
    border-collapse: collapse;
}
th, td {
    border: 1px solid;
    padding: .5rem;
}
h4 {
    margin: 1rem 0 0 0;
}
#cache-manager {
    margin: 0;
    padding: 0;
}
#cache-manager button {
    padding: .25rem;
    margin: 0 .25rem;
}
</style>

<template>
    <off-canvas>
        <setting-icon> </setting-icon>
        <template #off-canvas>
            <h2> Settings </h2>
            <table>
                <tr> 
                    <th> LOL Version </th>
                    <td> {{ information.version }} </td>
                </tr>
                <tr>
                    <th> Champions count </th>
                    <td> {{ information.championsCount }}</td>
                </tr>
                <tr>
                    <th> Skins count </th>
                    <td> {{ information.skinsCount }} </td>
                </tr>
            </table>
            <div id="cache-manager">
                <h4> Cache </h4>
                Current size: {{ cacheSize }} MB 
                <button @click="window.api.clearCache()" title="Erase the cache"> 
                    <sweep-icon> </sweep-icon>
                </button>
                <button @click="refreshCache()" title="Refresh the cache size">
                    <reload-icon> </reload-icon>
                </button>
            </div>
        </template>
    </off-canvas>
</template>