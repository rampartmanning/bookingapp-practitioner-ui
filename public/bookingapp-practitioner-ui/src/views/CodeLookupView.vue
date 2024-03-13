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

            <!-- create new option -->
            <div v-if="booking.can_create_booking_schedule_option_practitioner&&booking_practitioner.can_create_booking_schedule_option_practitioner">
              <h3>Provide a Schedule Option</h3>
              <v-row>
                <v-col cols="6">
                  <v-date-picker v-model="addScheduleOption_scheduleDate" 
                    title="Service Date" 
                    :show-adjacent-months="true"
                    :allowed-dates="booking_configuration.selectable_allowed_schedule_option_dates"></v-date-picker>
                </v-col>
                <v-col cols="6">

                  <v-row>
                    <v-col cols="6">
                      <v-select
                        v-model="addScheduleOption_scheduleHour"
                        :items="scheduleHours"
                        label="Hour"
                        persistent-hint
                        dense
                      ></v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        v-model="addScheduleOption_scheduleMinute"
                        :items="scheduleMinutes"
                        label="Minute"
                        persistent-hint
                        dense
                      ></v-select>
                    </v-col>
                  </v-row>                    
                  
                  <p>The duration of this treatment is {{ booking.treatment_duration_minutes }} mins.</p>
                
                <p>Preferred Service Date: {{ booking.preferred_service_date }} </p>

                <p>Scheduling Preferences: {{ booking.scheduling_preferences.join(", ") }}</p>


                <v-btn :disable="!canAddScheduleOption()" color="primary" @click="addScheduleOption">Submit Option</v-btn>

              </v-col>
            </v-row>

            </div>


            <v-btn v-if="booking_practitioner.can_decline_practitioner" size="small" color="primary" @click="showDeclineBooking=true">Decline Booking</v-btn>




            <h3 style = 'margin-top:10px;'>Booking Details</h3>


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

            booking_configuration: {
              schedule_option_timezone: "",
              schedule_option_minute_interval: null,
              selectable_allowed_schedule_option_dates: [],
              schedule_option_hour_of_earliest_start: null,
              schedule_option_hour_of_latest_start: null,
              hst_rate: null,
              selectable_preferred_service_dates: [],
              allowed_scheduling_preferences: []
            },

            // Decline Booking
            declineReason: '',
            showDeclineBooking: false,

            // Create Booking Schedule Option 
            scheduleHours: [],
            scheduleMinutes: [],            
            addScheduleOption_scheduleDate: null,
            addScheduleOption_scheduleHour: null,
            addScheduleOption_scheduleMinute: null         
        }
    },
    methods: {
      formatRelative,
      formatDate,

      resetNotifications() {
        this.showErrorAlert = false;
        this.errorMessage = '';
      },
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
      async loadConfiguration() {
        let headers = await api.getApiHeaders();
        try {
          let response = await axios.get(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + '/configuration'), { headers });
          this.booking_configuration = response.data.configuration;

          // update schedule minutes
          this.scheduleMinutes = [];
          for(let i = 0; i < 60; i+=this.booking_configuration.schedule_option_minute_interval) {
            this.scheduleMinutes.push(i < 10 ? '0' + i : '' + i);
          }

          this.scheduleHours = [];
          for(let i = this.booking_configuration.schedule_option_hour_of_earliest_start; i <= this.booking_configuration.schedule_option_hour_of_latest_start; i++) {
            this.scheduleHours.push(i < 10 ? '0' + i : '' + i);
          }


        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to get booking configuration.';
          }
          this.showErrorAlert = true;
        }
      },
      async loadRefresh() {
        await this.load();
        if(this.booking) {
          await this.loadConfiguration();
        }
        this.isLoading = false;
      },    
      openInGoogleMaps() {
        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.booking.address_string), '_blank');
      },
      async declineBooking() {
        this.showDeclineBooking = false;
        try {
          let headers = await api.getApiHeaders();
          await axios.put(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + "/decline"), { reason: this.declineReason }, { headers });
          this.loadRefresh();
        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to decline booking.';
          }
          this.showErrorAlert = true;        
        }
      },
      canAddScheduleOption() {
        return this.addScheduleOption_scheduleDate && this.addScheduleOption_scheduleHour && this.addScheduleOption_scheduleMinute;
      },

      // TODO: check dupes
      async addScheduleOption() {

        let dt = new Date(this.addScheduleOption_scheduleDate);
        dt = new Date(dt.toLocaleString("en-US", { timeZone: this.booking_configuration.schedule_option_timezone }));
        dt.setHours(parseInt(this.addScheduleOption_scheduleHour));
        dt.setMinutes(parseInt(this.addScheduleOption_scheduleMinute));
        dt.setSeconds(0);
        dt.setMilliseconds(0);      

        /*
        if(this.hasExistingScheduleOptionAlreadyExists(dt)) {
          this.errorMessage = "A schedule option already exists for this date and time for this practitioner. Please select another date and time.";
          this.showErrorAlert = true;
          this.hideShowAddScheduleOptionDialog();
          return;
        }
        */

        let data = {
          schedule_date: api.prepareDateTime(dt)
        };

        let headers = await api.getApiHeaders();
        try {
          await axios.post(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + '/create-booking-schedule-option'), data, { headers });
          await this.loadRefresh();
          // TODO: show confirm
          console.log("Good");
        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to create booking-schedule-option';
          }
          this.showErrorAlert = true;
        } 
      }
      
    },
    async mounted() {
        this.code = this.$route.path.replace("/", "");
        await this.loadRefresh();
    }
};
</script>
