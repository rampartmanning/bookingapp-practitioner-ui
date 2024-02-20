<template>
    <v-container>
      <v-app-bar density="compact">
          <v-app-bar-title>{{code}}</v-app-bar-title>
          <v-btn size="small" color="primary" @click="showDeclineBooking=true">Decline Booking</v-btn>          
      </v-app-bar>

      <!-- Decline Dialog -->
      <v-dialog
        v-model="showDeclineBooking"
        width="auto"
      >
        <v-card>
          <v-card-text>
            <p>Are you sure you want to decline this booking?</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="declineBooking()">Decline</v-btn>
            <v-btn @click="showDeclineBooking=false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>      

      <v-sheet width="1000">

        <v-alert
          v-if="showErrorAlert"
          type="error"
          title="Error"
          :text="'There was an error doing this operation. Message: ' + errorMessage"
        ></v-alert>

        <div v-if="booking_practitioner&&booking">
          <p>Your Status: {{ booking_practitioner.current_status_label }}</p>
          <p>Address: {{  booking.address_string }}</p>
          <p>Treatment: {{  booking.treatment_display_name }}</p>  
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
            mapZoom: 14,

            showDeclineBooking: false 
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
      declineBooking() {
        console.log("Handle Decline booking");

      }   
    },
    mounted() {
        this.code = this.$route.path.replace("/", "");
        this.loadRefresh();
    }
};
</script>
