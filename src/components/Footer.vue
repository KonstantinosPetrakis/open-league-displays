<script setup>
import { RouterLink } from "vue-router";
import InformationIcon from "./svgs/InformationIcon.vue";
</script>

<style scoped>
    #footer {
        display: flex;
        position: sticky;
        align-items: center;
        justify-content: space-between;
        margin: 0 1rem;
    }
    #footer > * {
        display: block;
        margin: 0.2rem;
    }
    small {
        color: #343436
    }
    svg {
        width: 1rem;
        height: 1rem;
    }

</style>

<template>
    <div id="footer">
        <small> Open League Displays v0.1 </small>
        <router-link :to="{name: 'information'}">
            <information-icon> </information-icon>
        </router-link>
    </div>
</template>