<script setup>
import { ref } from 'vue';
import counter from "./components/counter.vue";

const msg = ref('Message from electron wasn\'t received yet');
window.api.ping().then((message) => {msg.value = message;});
</script>

<template>
    <h1> Here is the counter: </h1>
    <p> Here is the message from electron: {{ msg }} </p>
    <counter> </counter>
</template>