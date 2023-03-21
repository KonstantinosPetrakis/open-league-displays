<script setup>
import { ref } from "vue";
import OffCanvas from "./ui/OffCanvas.vue";
import ProgressBar from "./ui/ProgressBar.vue";
import SettingIcon from "./svgs/SettingIcon.vue";


const percentage = ref(0);
const currentLeagueOfLegendsVersion = ref();

var updateProggress = setInterval(() => {
    if (percentage.value < 100) percentage.value += 0.5;
    else clearInterval(updateProggress);
}, 50);

window.api.getCurrentVersion().then((version) => {
    currentLeagueOfLegendsVersion.value = version;
});

</script>

<style scoped>
.align-left {
    align-self: flex-start;
}
</style>

<template>
    <off-canvas>
        <setting-icon> </setting-icon>
        <template #off-canvas>
            <h2> Settings </h2>
            <div id="update">
                <h5> An update is undergo in the background. </h5>
                <progress-bar :percentage="percentage"> </progress-bar>
            </div>
            <div class="align-left">
                League of Legends version: {{currentLeagueOfLegendsVersion}}
            </div>
        </template>
    </off-canvas>
</template>