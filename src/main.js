import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Champions from "./views/Champions.vue";
import Favorites from './views/Favorites.vue';
import Information from "./views/Information.vue";
import Settings from "./views/Settings.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [   
        { path: '/', component: Champions },
        { path: '/favorites', component: Favorites },
        { path: '/information', component: Information },
        { path: '/settings', component: Settings }
    ]
});

createApp(App)
    .use(router)
    .mount('#app');