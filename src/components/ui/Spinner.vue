<style scoped>
.loader {
    width: 2.8rem;
    height: 2.8rem;
    border: .3rem solid #A09B8C;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1.4s linear infinite;
    margin: 1rem;
}

@keyframes rotation {
0% {
    transform: rotate(0deg);
}
100% {
    transform: rotate(360deg);
}
} 
</style>

<template>
    <span class="loader"></span>
</template>