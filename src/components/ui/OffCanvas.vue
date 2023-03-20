<script setup>
import { ref } from 'vue';

const active = ref(false);

</script>

<style scoped>
    .off-canvas {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: fixed;
        visibility: hidden;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 75%;
        height: 90%;
        z-index: 100;
        padding: 1rem;
        background-color: #010A13;
        border: 1px solid #785b288d;
        overflow: auto;
    }
    .off-canvas.active {
        visibility: visible;
    }
    .background-filter {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99;
        background-color: rgba(0, 0, 0, 0.646);
        visibility: hidden;
        overflow: hidden;
    }
    .background-filter.active {
        visibility: visible;
    }
    .simple-button {
        all: unset;
    }
    .exit-button {
        margin-top: 1rem;
    }
</style>

<template>
    <button class="simple-button" @click="active=true">
        <slot> </slot>
    </button>
    <div class="background-filter" :class="{'active': active}"></div>
    <div class="off-canvas" :class="{'active': active}">
        <slot name="off-canvas"> </slot> 
        <button class="exit-button" @click="active=false"> done </button>
    </div>
</template>