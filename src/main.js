import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Champions from "./views/Champions.vue";
import Information from "./views/Information.vue";
import Settings from "./views/Settings.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [   
        { path: '/', component: Home },
        { path: '/champions', component: Champions },
        { path: '/information', component: Information },
        { path: '/settings', component: Settings }
    ]
});

createApp(App)
    .use(router)
    .mount('#app');