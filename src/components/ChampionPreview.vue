<script setup>
const props = defineProps({champion: { type: Object, required: true}});

</script>

<style scoped>
    .champion {
        display: flex;
        position: relative;
        flex-direction: column;
        align-items: center;
        width: 8rem;
        padding: 0;
        margin: 0;
        border: 1px solid #f0e6d214;
        transition: border .6s;
    }
    .champion:hover {
        border: 1px solid #ddbb7850;
        transition: border .6s;
    }
    .champion img {
        width: 100%;
        clip-path: inset(0% 0% 25% 0%);
        margin-bottom: -46%;
        /* 
            margin-bottom is a magic number, 25% should be the right from the clip-path but that
            won't work as intended.
        */ 
    }
    .champion-name {
        text-align: center;
        font-size: .72rem;
        letter-spacing: .11rem;
        text-transform: uppercase;
        padding: .8rem 0;
        color: #be9f60;
    }
</style>

<template>
    <div class="champion">
        <img :src="champion.image" :alt="`image of ${champion.id}`">
        <div class="champion-name"> {{ champion.name }} </div>
    </div>
</template>