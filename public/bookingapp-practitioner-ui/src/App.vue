<template>
  <v-app>
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
