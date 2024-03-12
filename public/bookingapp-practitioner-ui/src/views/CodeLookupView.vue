<template>
    <v-container>
      <v-sheet width="1000">
        <v-row>
          <v-col cols="6" class="text-left">
            <!-- Logo -->         
            <v-img
              src="https://static.wixstatic.com/media/3a7bcf_15f013d1aa5d4cc9927724881eeddf05~mv2.png/v1/fill/w_266,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/HealthCasa_Logo_Web%20No%20Bkgd_Left.png"
              style="width: 266px;height:55px;"
            ></v-img>
          </v-col>
          <v-col cols="6" class="text-right">
            <code style="font-family: monospace;">{{ code }}</code>
          </v-col>
        </v-row>

        <!-- Decline Booking -->
        <v-dialog v-model="showDeclineBooking" max-width="500">
          <v-card>
            <v-card-title>
              Decline Booking
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="declineReason"
                label="Reason"
                required
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="showDeclineBooking = false">Cancel</v-btn>
              <v-btn color="primary" @click="declineBooking">Decline</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
        <!-- Alerts -->
        <v-alert
          v-if="showErrorAlert"
          type="error"
          title="Error"
          :text="'There was an error doing this operation. Message: ' + errorMessage"
        ></v-alert>
        

        <div v-if="booking_practitioner&&booking" style="margin-top:10px;">

          <v-alert
            type="info"
            :text="'Status: ' + booking_practitioner.current_status_end_label + (booking_practitioner.current_status == 'waiting_for_practitioner' ? '. Respond by ' + formatRelative(booking_practitioner.expires_at, new Date()) + '.' : '')"
            variant="tonal"
          ></v-alert>          

          <v-sheet style = 'margin-top:10px;'>

            <v-btn v-if="booking_practitioner.can_decline_practitioner" size="small" color="primary" @click="showDeclineBooking=true">Decline Booking</v-btn>          


            <h3 style = 'margin-top:10px;'>Booking Details</h3>

            <!-- your options -->

            <v-table density="compact">
              <tbody>
                <tr>
                  <td width = '25%'>Treatment</td>
                  <td width = '75%'>{{ booking.treatment_display_name }}</td>
                </tr>
                <tr>
                  <td>Duration</td>
                  <td>{{ booking.duration_minutes }} mins</td>
                </tr> 
                <tr v-if="booking_practitioner.current_status == 'waiting_for_practitioner'">
                  <td>Preferred Service Date</td>
                  <td>{{ booking.preferred_service_date }}</td>
                </tr>
                <tr v-if="booking_practitioner.current_status == 'waiting_for_practitioner'">
                  <td>Scheduling Preferences</td>
                  <td>{{ booking.scheduling_preferences.join(", ") }}</td>
                </tr>
                <tr v-if="booking_practitioner.current_status == 'waiting_for_practitioner'">
                  <td>Client Notes</td>
                  <td>{{ booking.client_notes }}</td>
                </tr>               
                <tr>
                  <td>Address</td>
                  <td>{{ booking.address_string }}
                    <v-icon color="primary" @click="openInGoogleMaps()">mdi-open-in-new</v-icon>
                  </td>
                </tr>                
              </tbody>
            </v-table>

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

          </v-sheet>


        </div>

      </v-sheet>

    </v-container>
  </template>
  
<script>
import axios from 'axios';
import api from '@/api.js';
import { GoogleMap, Marker } from "vue3-google-map";
import { formatRelative, format as formatDate } from 'date-fns';
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

            // Decline Booking
            declineReason: '',
            showDeclineBooking: false
        }
    },
    methods: {
      formatRelative,
      formatDate,
      async load() {
        let headers = await api.getApiHeaders();
        try {
          let response = await axios.get(api.getApiUrl('p/booking-practitioner/by_code/' + this.code), { headers });
          this.booking_practitioner = response.data.booking_practitioner;
          if(this.booking_practitioner.expires_at) {
            this.booking_practitioner.expires_at = new Date(this.booking_practitioner.expires_at);
          }
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
      openInGoogleMaps() {
        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.booking.address_string), '_blank');
      },
      declineBooking() {
        console.log("Handle Decline booking");
        this.showDeclineBooking = false;
      }   
    },
    mounted() {
        this.code = this.$route.path.replace("/", "");
        this.loadRefresh();
    }
};
</script>
