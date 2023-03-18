<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView } from "vue-router";


// const msg = ref('Message from electron wasn\'t received yet');
// window.api.getUpdateState().then((message) => {msg.value = message;});
</script>

<template>
    
    <router-link to="/">Home</router-link>
    <router-link to="/settings">Settings</router-link>
    <router-link to="/information">Information</router-link>
    <router-link to="/champions">Champions</router-link>
    <router-link to="/settings">Settings</router-link>

    <router-view> </router-view>
</template>