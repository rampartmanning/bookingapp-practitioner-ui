<template>
    <v-container>

      <v-sheet width="1000">

        <p>Code Lookup: {{ code }}</p>

      </v-sheet>

    </v-container>
  </template>
  
<script>
export default {
    name: 'CodeLookupView',
    data() {
        return {
            code: null
        }
    },
    mounted() {
        this.code = this.$route.path.replace("/", "");
    }
};
</script>
