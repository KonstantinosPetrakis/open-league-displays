<script setup>
const props = defineProps({champion: { type: Object, required: true}});

</script>

<style scoped>
    .champion {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 7.5rem;
        border: 1px solid #F0E6D2;
        padding: 0;
        margin: 0;
    }
    .champion img {
        width: 100%;
        clip-path: inset(10%); 
        scale: 125%;
        /* 125 it's a magic number, 120% should be the right because 10% + 10% = 20% from inset*/
    }
    .champion-name {
        text-align: center;
        font-size: 0.9rem;
        text-transform: uppercase;
        padding: .8rem 1.2rem;
    }
</style>

<template>
    <div class="champion">
        <img :src="champion.image" :alt="`image of ${champion.id}`">
        <div class="champion-name"> {{ champion.id }} </div>
    </div>
</template>