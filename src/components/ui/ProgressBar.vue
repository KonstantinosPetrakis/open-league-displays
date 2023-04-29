<script setup>
    const props = defineProps(["percentage"]);
</script>

<style scoped>
    .scroll-bar-wrapper {
        position: relative;
        width: 100%;
        height: 1.5rem;
        border: 1px solid #C89B3C;
    }
    .scroll-bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%; 
        width: 0;
        background: linear-gradient(#005A82 0%, #0AC8B9 100%);
    }
</style>

<template>
    <div class="scroll-bar-wrapper">
        <div class="scroll-bar" :style="{ width: `${percentage}%` }"></div>
    </div>
</template>