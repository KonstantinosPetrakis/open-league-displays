<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
    #footer {
        display: flex;
        justify-content: space-between;
        margin: 0 1rem;
    }
</style>

<template>
    <div id="footer">
        <p> Open League Displays </p>
        <div>
            <router-link to="/information">
                <img src="../assets/images/question-solid.svg" alt="information">
            </router-link>
        </div>
    </div>
</template>