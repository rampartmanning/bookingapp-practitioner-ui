<template>
    <v-container>

      <v-sheet width="1000">

        <v-alert
          v-if="showErrorAlert"
          type="error"
          title="Error"
          :text="'There was an error doing this operation. Message: ' + errorMessage"
        ></v-alert>

        <div v-if="booking_practitioner">
          <h1>{{ code }}</h1>
           
          <p>Status: {{ booking_practitioner.current_status_label }}</p>

        </div>

      </v-sheet>

    </v-container>
  </template>
  
<script>
import axios from 'axios';
import api from '@/api.js';

export default {
    name: 'CodeLookupView',
    data() {
        return {
            isLoading: true,
            code: null,
            booking_practitioner: null,
            showErrorAlert: false,
            errorMessage: ''
        }
    },
    methods: {
      async load() {
        let headers = await api.getApiHeaders();
        try {
          let response = await axios.get(api.getApiUrl('p/booking/by_code/' + this.code), { headers });
          this.booking_practitioner = response.data.booking_practitioner;
          console.log('booking_practitioner:', this.booking_practitioner)
        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to get booking.';
          }
          this.showErrorAlert = true;
        }          
      },
      async loadRefresh() {
        await this.load();
        this.isLoading = false;
      },       
    },
    mounted() {
        this.code = this.$route.path.replace("/", "");
        this.loadRefresh();
    }
};
</script>
