import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import Champions from "./views/Champions.vue";
import Favorites from './views/Favorites.vue';
import Information from "./views/Information.vue";


const router = createRouter({
    history: createWebHashHistory(),
    routes: [   
        { path: '/', component: Champions },
        { path: '/favorites', component: Favorites },
        { path: '/information', component: Information },
    ]
});

createApp(App)
    .use(router)
    .mount('#app');