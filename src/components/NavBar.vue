<script setup>
import { RouterLink } from "vue-router";
import Settings from "./Settings.vue";
</script>

<style scoped>
    #nav-bar {
        display: flex;
        position: sticky;
        width: 100%;
        height: 3rem;
        align-items: center;
        justify-content: space-between;
        padding: 0.1rem 1rem;
        background-color: #010A13;
        border-bottom: 1px solid #b1a28399;
    }
    #logo img {
        width: 1.9rem;
    }
    #items {
        display: flex;
        align-items: center;
        height: 100%;
    }
    #items a {
        display: flex;
        align-items: center;
        margin: 0 1.5rem;
        height: 100%;
        font-family: "Beaufort";
        font-weight: bold;
        letter-spacing: .12em;
        font-size: .78rem;
        color: #c5b594;     
        text-transform: uppercase;
        text-decoration: none;   
    }
    #items a.router-link-active {
        position: relative;
        color: #F0E6D2;
    }
    #items a.router-link-active::before {
        content: "";
        position: absolute;
        top: 100%;
        left: 0%;
        width: 100%;
        height: 1px;
        border-bottom: 2px solid #c69b3e;
    }
</style>

<template>
    <div id="nav-bar">
        <div id="logo">
            <router-link to="/">
                <img src="/images/lol_icon.png" alt="logo of league of legends">
            </router-link>
        </div>
        <div id="items">
            <router-link :to="{name: 'index'}">Champions</router-link>
            <router-link :to="{name: 'favorites'}">Favorites</router-link>
        </div>
        <div id="settings">
            <settings> </settings>
        </div>
    </div>
</template>