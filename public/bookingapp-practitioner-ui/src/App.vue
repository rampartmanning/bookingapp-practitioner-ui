<template>
  <v-img
      src="https://static.wixstatic.com/media/3a7bcf_15f013d1aa5d4cc9927724881eeddf05~mv2.png/v1/fill/w_266,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/HealthCasa_Logo_Web%20No%20Bkgd_Left.png"
      max-height="40"
      contain
    ></v-img>
  <v-app>
    <v-app-bar app>
    <!-- Logo -->         
      <v-img
        src="https://static.wixstatic.com/media/3a7bcf_15f013d1aa5d4cc9927724881eeddf05~mv2.png/v1/fill/w_266,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/HealthCasa_Logo_Web%20No%20Bkgd_Left.png"
        max-height="40"
        contain
      ></v-img>      
    </v-app-bar>
>
    <v-main class="d-flex justify-center" style="min-height: 300px;">
      <router-view></router-view>
    </v-main>

    <v-footer app>
      <span>&copy; 2024 Health Casa Limited</span>
      <v-spacer></v-spacer>
      <span style = 'color:darkorange;' v-if="showStage">This is the {{ stage }} Environment.</span>
    </v-footer>
  </v-app>
</template>

<script>
import settings from '@/settings.js';

export default {
  name: 'App',
  computed: {
    showStage() {
      return settings.stage !== 'prod';
    },
    stage() {
      return settings.stage.toUpperCase();
    }
  }
}
</script>
