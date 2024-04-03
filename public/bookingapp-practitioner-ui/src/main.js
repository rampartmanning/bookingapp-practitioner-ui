import { createApp } from 'vue';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import App from './App.vue';

import { createRouter, createWebHistory } from 'vue-router'; 
import HomeView from './views/HomeView.vue';
import CodeLookupView from './views/CodeLookupView.vue';

const routes = [
    { path: '/', component: HomeView, meta: { title: 'Home' } },
    { path: '/:pathMatch(.*)*', component: CodeLookupView, meta: { title: 'Code Lookup' } }
];

const router = createRouter({
    history: createWebHistory(), 
    routes
});

router.beforeEach((to, from, next) => {
    let title = '';
    if(to.meta.title === 'Code Lookup') {
        title = to.href.replace('/','');    
    } else {        
        title = to.meta.title;
        title += ' - Health Casa Practitioner Tool';
    }
    document.title = title;
    next();
});


// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi'
    }
})

createApp(App).use(vuetify).use(router).use(VCalendar, {}).mount('#app')


  
