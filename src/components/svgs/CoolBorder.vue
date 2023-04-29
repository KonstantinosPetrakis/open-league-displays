<script setup>
const props = defineProps({ 
    position: {type: String, default: "top", validator: (value) => ["top", "bottom"].includes(value)}
});

</script>

<style scoped>
svg {
    position: absolute;
    left: 5%;
    width: 90%;
}
svg.top {
    top: 0;
    transform: translateY(calc(-100% + 3px));
}
svg.bottom {
    bottom: 0;
    transform: translateY(calc(100% - 3px)) rotate(180deg);
}
svg path {
    stroke-width: 1px;
    stroke: #785b28bb;
    fill: #010A13;
}
svg:hover path {
    filter: brightness(1); /* override behaviour defined in base.css */
}
</style>

<template>
    <svg :class="position" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="745px" height="11px" viewBox="0 0 745 11">
        <path d="M4.000,8.000 L9.000,1.1000 L734.1000,1.1000 L739.1000,8.000 L4.000,8.000 Z"/>
    </svg>
</template>

