<script setup>
import { ref } from 'vue';

const count = ref(0);

</script>

<template>
    <p>
        <button @click="count++">+</button>
        <button @click="count--">-</button>
        <div> {{ count }} </div>
    </p>
</template>