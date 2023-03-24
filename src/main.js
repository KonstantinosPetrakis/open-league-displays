import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import Champions from "./views/Champions.vue";
import Favorites from './views/Favorites.vue';
import Information from "./views/Information.vue";
import Champion from "./views/Champion.vue";


const router = createRouter({
    history: createWebHashHistory(),
    routes: [   
        { path: '/', component: Champions, name: "index"},
        { path: '/favorites', component: Favorites, name: "favorites"},
        { path: '/information', component: Information, name: "information"},
        { path: '/champion/:id', component: Champion, name: "champion"},
    ]
});

createApp(App)
    .use(router)
    .mount('#app');