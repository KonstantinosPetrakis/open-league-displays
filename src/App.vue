<script setup>
import { ref, computed, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';
import OffCanvas from "./components/ui/OffCanvas.vue";
import ProgressBar from "./components/ui/ProgressBar.vue";


window.api.checkForUpdate();
const updateBeginTime = Date.now();
const updateState = ref({updating: false, currentIterations: 0, totalIterations: 1});

window.api.onUpdateUpdateState(newUpdateState => updateState.value = newUpdateState);
onUnmounted(() => window.api.offUpdateUpdateState());

const updating = computed(() => updateState.value.updating);
const progress = computed(() => updateState.value.currentIterations / updateState.value.totalIterations * 100);
const eta = computed(() => {
    const timeElapsed = Date.now() - updateBeginTime;
    const timePerIteration = timeElapsed / updateState.value.currentIterations;
    const timeRemaining = timePerIteration * (updateState.value.totalIterations - updateState.value.currentIterations);
    const minutesRemaining = Math.floor(timeRemaining / 1000 / 60);
    const secondsRemaining = Math.floor(timeRemaining / 1000 % 60);

    if (!isFinite(minutesRemaining)) return "Unknown time";
    return `${minutesRemaining} minutes and ${secondsRemaining} seconds`;
});
</script>

<style scoped>
    #main-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: rgb(9,20,40);
        background: linear-gradient(45deg, rgba(9,20,40,1) 0%, rgba(0,0,0,1) 100%);
    }
    main {
        padding: 1.5rem;
        overflow: auto;
        margin-bottom: auto;
    }
    h3 {
        margin: 0;
    }
    #progress-bar-wrapper {
        width: 50%;
    }

</style>

<template>
    <div id="main-container">
        <nav>
            <nav-bar> </nav-bar>
        </nav>
        <main>
            <off-canvas v-if="updating" :active="true" :compact="true" :exit-button="false">
                <template #off-canvas> 
                    <h3> Updating... </h3>
                    <p> 
                        This will take some time, go brew yourself a cup of coffee.
                    </p>
                    <div id="progress-bar-wrapper">
                        <progress-bar :percentage="progress"> </progress-bar>
                    </div>
                    <p>
                        ETA: {{ eta }}
                    </p>
                </template>
            </off-canvas>
            <router-view v-else> </router-view>
        </main>
        <footer>
            <Footer> </Footer>
        </footer>
    </div>
</template>