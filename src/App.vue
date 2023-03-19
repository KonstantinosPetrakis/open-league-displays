<script setup>
import { ref } from 'vue';
import { RouterView } from "vue-router";
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';
</script>

<style scoped>
    #main-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    main {
        margin-bottom: auto;
    }
</style>

<template>
    <div id="main-container">
        <nav>
            <nav-bar> </nav-bar>
        </nav>
        <main>
            <router-view> </router-view>
        </main>
        <footer>
            <Footer> </Footer>
        </footer>
    </div>
</template>