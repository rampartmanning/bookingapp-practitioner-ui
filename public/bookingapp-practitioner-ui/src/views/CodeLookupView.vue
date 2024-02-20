<template>
    <v-container>

      <v-sheet width="1000">

        <v-alert
          v-if="showErrorAlert"
          type="error"
          title="Error"
          :text="'There was an error doing this operation. Message: ' + errorMessage"
        ></v-alert>

        <div v-if="booking_practitioner&&booking">
          <h1>{{ code }}</h1>
           
          <p>Status: {{ booking_practitioner.current_status_label }}</p>

          <h2>Booking Information</h2>
          <p>Address: {{  booking.address_string }}</p>
          <p>Client Type: {{  booking.client_type }}</p>
          <p>Treatment: {{  booking.treatment_display_name }}</p>  
          <p>Treatment Category: {{  booking.treatment_category_display_name }}</p>
          <p>Created At: {{  formatDate(booking.created_at, 'PPpp') }}</p>
          <p>Preferred Service Date: {{ booking.preferred_service_date }}</p>
          <p>Scheduling Preferences: {{ booking.scheduling_preferences.join(", ") }}</p>
          <p>Duration: {{ booking.duration_minutes }} mins</p>
          <p>Client Notes: {{ booking.client_notes }}</p>

          <GoogleMap
            :api-key="googleMapsApiKey"
            :center="mapCenter"
            :zoom="mapZoom"
            style="width: 100%; height: 600px; margin-top:10px;"
            :options="{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: true,
                fullscreenControl: false
            }">
              <Marker :options="mapMarkerOptions" />

          </GoogleMap>


        </div>

      </v-sheet>

    </v-container>
  </template>
  
<script>
import axios from 'axios';
import api from '@/api.js';
import { GoogleMap, Marker } from "vue3-google-map";
import { format as formatDate } from 'date-fns';
import settings from '@/settings.js';

export default {
    name: 'CodeLookupView',
    components: { 
        GoogleMap,
        Marker
    },    
    data() {
        return {
            isLoading: true,
            code: null,
            booking_practitioner: null,
            booking: null,
            showErrorAlert: false,
            errorMessage: '',

            googleMapsApiKey: settings.googleMapsApiKey,
            mapCenter: { "lat": null, "lng": null },
            mapMarkerOptions: { position: { "lat": null, "lng": null }, title: "Client Location" },
            mapZoom: 14
        }
    },
    methods: {
      formatDate,
      async load() {
        let headers = await api.getApiHeaders();
        try {
          let response = await axios.get(api.getApiUrl('p/booking/by_code/' + this.code), { headers });
          this.booking_practitioner = response.data.booking_practitioner;
          this.booking = response.data.booking;
          this.mapCenter.lat = this.booking.lat;
          this.mapCenter.lng = this.booking.lng;
          this.mapMarkerOptions.position.lat = this.booking.lat;
          this.mapMarkerOptions.position.lng = this.booking.lng;

          console.log('booking_practitioner:', this.booking_practitioner)
          console.log('booking:', this.booking)
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
