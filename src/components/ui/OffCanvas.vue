<script setup>
import CoolBorder from "../svgs/CoolBorder.vue"

const props = defineProps({
    active: {type: Boolean, default: false},
    exitButton: {type: Boolean, default: true},
    compact: {type: Boolean, default: false}
});

</script>

<style scoped>
    .off-canvas {
        position: fixed;
        visibility: hidden;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 75%;
        height: 90%;
        z-index: 100;
        background-color: #010A13;
        border: 1px solid #785b288d;
    }
    .off-canvas.active {
        visibility: visible;
    }
    .off-canvas.compact {
        width: 75%;
        height: auto;
    }
    .off-canvas-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 1rem;
        overflow: auto;
    }
    .off-canvas.compact .off-canvas-content {
        padding: 0;
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
    }
    .background-filter.active {
        visibility: visible;
    }
    .simple-button {
        all: unset;
    }
    .simple-button:hover {
        cursor: pointer;
    }
    .exit-button {
        margin-top: 1rem;
    }
</style>

<template>
    <button class="simple-button" @click="active=true">
        <slot> </slot>
    </button>

    <div class="background-filter" :class="{'active': active}" @click="active=!compact"></div>

    <div class="off-canvas" :class="{'active': active, 'compact': compact}">
        <cool-border> </cool-border>
        <div class="off-canvas-content">
            <slot name="off-canvas"> </slot> 
            <button v-if="exitButton" class="exit-button" @click="active=false"> done </button>
        </div>
        <cool-border position="bottom"> </cool-border> 
    </div>
</template>