import { createApp } from 'vue';
import App from './App.vue';

import { createRouter, createWebHashHistory } from 'vue-router'; // Import createRouter and createWebHashHistory from vue-router package
import HomeView from './views/HomeView.vue';

const routes = [
    { path: '/', component: HomeView, meta: { title: 'Home' } }
];

const router = createRouter({
    history: createWebHashHistory(), // Use createWebHashHistory instead of createWebHistory
    routes
});

router.beforeEach((to, from, next) => {
    let title = '';
    if (to.meta.title) {
        title += to.meta.title + ' - ';
    }
    title += 'Health Casa Practitioner Tool';
    document.title = title;
    next();
});


// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi'
    }
})

createApp(App).use(vuetify).use(router).mount('#app')


  
