<style scoped>
div {
    margin-right: .5rem;
    padding: .5rem .5rem .5rem 0;
    border-right: 2px solid #c7bd93;
}
svg {
    height: 1.5rem;
    width: 1.5rem;
}
path {
    fill: #b6b3a6;
}
svg:hover path {
    filter: brightness(1); /* override svg behaviour defined in base.css */
}
</style>

<template>
    <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
        </svg>
    </div>
</template>