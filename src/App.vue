<script setup>
import { RouterView } from "vue-router";
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';

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
</style>

<template>
    <div id="main-container">
        <!-- 
            Here I should add a offcanvas without exitbutton if this is the first time the app
            is opened so the download is done.
            I could save a boolean in the localstorage to check if this is the first time.
        -->
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