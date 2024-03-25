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
              <v-btn @click="showDeclineBooking = false" :disabled="updateUnderway">Cancel</v-btn>
              <v-btn color="primary" @click="declineBooking" :disabled="updateUnderway">Decline</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Remove Option -->
        <v-dialog v-model="showRemoveScheduleOption" max-width="500">
          <v-card>
            <v-card-title>
              Remove Schedule Option
            </v-card-title>
            <v-card-text>
              <p>Are you sure?</p>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="showRemoveScheduleOption = false" :disabled="updateUnderway">Cancel</v-btn>
              <v-btn color="primary" @click="removeScheduleOption()" :disabled="updateUnderway">Remove</v-btn>
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
                  <VDatePicker v-model="addScheduleOption_scheduleDate" 
                      expanded 
                      view="weekly"
                      :min-date="booking_configuration.selectable_allowed_schedule_option_dates[0]"
                      :max-date="booking_configuration.selectable_allowed_schedule_option_dates[booking_configuration.selectable_allowed_schedule_option_dates.length - 1]"
                    />
                    <v-row style = 'margin-top:10px;'>
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
                </v-col>
                <v-col cols="6">

                  <p>The duration of this treatment is {{ booking.treatment_duration_minutes }} mins.</p>
                
                  <p style = 'margin-top:10px;'>Preferred Service Date: {{ booking.preferred_service_date }} </p>

                  <p style = 'margin-top:10px;'>Scheduling Preferences: {{ booking.scheduling_preferences.join(", ") }}</p>

                  <v-btn style = 'margin-top:10px;' :disabled="!canAddScheduleOption()||updateUnderway" color="primary" @click="addScheduleOption">{{ bookingScheduleOptions.length ? 'Submit Another Option' : 'Submit Option' }}</v-btn>

              </v-col>
            </v-row>

            </div>

            <div style="margin-top:20px;" class = 'data-table-wrapper' v-if="bookingScheduleOptions.length">

              <h3>Your Options</h3>

              <v-data-table
                :headers="getOptionHeaders()"
                :items="bookingScheduleOptions"
                :sort-by="[{ key: 'schedule_date', order: 'asc' }]"
                density="compact"
                :items-per-page="100"
                :row-props="getRowPropsForBookingScheduleOption"                
              >
              <template v-slot:bottom> </template>
              <!-- eslint-disable-next-line -->
              <template v-slot:item.schedule_date_date="{ item }">
                  <code>{{ formatDate(item.schedule_date_date, 'PP') }}</code>
              </template>
              <!-- eslint-disable-next-line -->
              <template v-slot:item.schedule_date_time="{ item }">
                <code>{{ formatDate(item.schedule_date_time, 'p') }}</code>
              </template>
              <!-- eslint-disable-next-line -->
              <template v-slot:item.schedule_date_end_time="{ item }">
                <code>{{ formatDate(item.schedule_date_end, 'p') }}</code>
              </template>
              <!-- eslint-disable-next-line -->
                <template v-slot:item.actions="{ item }">
                  <v-icon
                    v-if="canEditBookingScheduleOption(item)"
                    size="small"
                    icon="mdi-close"
                    class="me-2"
                    @click="showRemoveScheduleOptionDialogForBookingScheduleOption(item)"
                  >
                  </v-icon>
                </template>                  
              </v-data-table>
            </div>

            <v-btn v-if="booking_practitioner.can_decline_practitioner" size="small" color="primary" @click="showDeclineBooking=true" :disabled="updateUnderway">Decline Booking</v-btn>




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
            updateUnderway: false,

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

            bookingScheduleOptions: [],

            scheduleOptions_headers: [
            {
              title: 'Date',
              key: 'schedule_date_date',
              sortable: true,
              width: '20%'
            },
            {
              title: 'Start',
              key: 'schedule_date_time',
              sortable: true,
              width: '20%'
            },
            {
              title: 'End',
              key: 'schedule_date_end_time',
              sortable: true,
              width: '20%'
            },
            {
              title: 'Option Status',
              key: 'current_status_end_label',
              sortable: true,
              width: '20%'
            },
            {
              title: 'Actions',
              key: 'actions',
              sortable: false,
              align: 'end',
              width: '20%'
            }],            

            // Decline Booking
            declineReason: '',
            showDeclineBooking: false,

            // Create Booking Schedule Option 
            scheduleHours: [],
            scheduleMinutes: [],            
            addScheduleOption_scheduleDate: null,
            addScheduleOption_scheduleHour: null,
            addScheduleOption_scheduleMinute: null,

            // Remove Option
            showRemoveScheduleOption: false,
            bookingScheduleOptionToRemove: null
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
      async loadScheduleOptions() {
        let headers = await api.getApiHeaders();
        try {
          let response = await axios.get(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + '/list-booking-schedule-options'), { headers });
          this.bookingScheduleOptions = response.data.booking_schedule_options;
          this.bookingScheduleOptions = this.bookingScheduleOptions.map(option => {
            option.schedule_date = new Date(option.schedule_date);
            option.schedule_date_date = new Date(option.schedule_date); // for sorting
            option.schedule_date_time = new Date(option.schedule_date); // for sorting
            option.schedule_date_end = new Date(option.schedule_date_end);
            return option;
          });
        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to get booking schedule options.';
          }
          this.showErrorAlert = true;
        }
      },
      async loadRefresh() {
        await this.load();
        if(this.booking) {
          await this.loadConfiguration();
          await this.loadScheduleOptions();
        }
        this.isLoading = false;
      },   
      getOptionHeaders() {
        let hasActions = false;
        for (let oitem of this.bookingScheduleOptions) {
          if (oitem.can_edit_booking_schedule_option_practitioner) {
            hasActions = true;
            break;
          }
        }
        if (hasActions) {
          return this.scheduleOptions_headers;
        } else {
          return this.scheduleOptions_headers.filter(o => o.key !== 'actions');
        }
      },
      openInGoogleMaps() {
        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.booking.address_string), '_blank');
      },
      async declineBooking() {
        this.showDeclineBooking = false;
        this.updateUnderway = true;
        try {
          let headers = await api.getApiHeaders();
          await axios.put(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + "/decline"), { reason: this.declineReason }, { headers });
          await this.loadRefresh();
        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to decline booking.';
          }
          this.showErrorAlert = true;        
        } finally {
          this.updateUnderway = false;
        }
      },
      canAddScheduleOption() {
        return this.addScheduleOption_scheduleDate && this.addScheduleOption_scheduleHour && this.addScheduleOption_scheduleMinute;
      },

      hasExistingScheduleOptionAlreadyExists(dt) {
        let matching = this.bookingScheduleOptions.find(option => {
          let optionDate = new Date(option.schedule_date);
          return optionDate.getTime() === dt.getTime();
        });
        if (matching) {
          return true;
        }
        return false;
      },

      async addScheduleOption() {

        let dt = new Date(this.addScheduleOption_scheduleDate);
        dt = new Date(dt.toLocaleString("en-US", { timeZone: this.booking_configuration.schedule_option_timezone }));
        dt.setHours(parseInt(this.addScheduleOption_scheduleHour));
        dt.setMinutes(parseInt(this.addScheduleOption_scheduleMinute));
        dt.setSeconds(0);
        dt.setMilliseconds(0);      

        if(this.hasExistingScheduleOptionAlreadyExists(dt)) {
          this.errorMessage = "A schedule option already exists for this date and time. Please select another date and time.";
          this.showErrorAlert = true;
          this.hideShowAddScheduleOptionDialog();
          return;
        }

        let data = {
          schedule_date: api.prepareDateTime(dt)
        };

        this.updateUnderway = true;
        let headers = await api.getApiHeaders();
        try {
          await axios.post(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + '/create-booking-schedule-option'), data, { headers });
          await this.loadRefresh();

          // Reset 
          this.addScheduleOption_scheduleDate = null;
          this.addScheduleOption_scheduleHour = null;
          this.addScheduleOption_scheduleMinute = null;

        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to create booking-schedule-option';
          }
          this.showErrorAlert = true;
        } finally {
          this.updateUnderway = false;
        }
      },
      canEditBookingScheduleOption(bso) {
        return bso.can_edit_booking_schedule_option_practitioner;
      },      
      showRemoveScheduleOptionDialogForBookingScheduleOption(bso) {
        this.showRemoveScheduleOption = true;
        this.bookingScheduleOptionToRemove = bso;
      },
      async removeScheduleOption() {
        this.showRemoveScheduleOption = false;
        this.updateUnderway = true;
        let headers = await api.getApiHeaders();
        try {
          await axios.delete(api.getApiUrl('p/booking-practitioner/by_code/' + this.code + '/delete-booking-schedule-option/' + this.bookingScheduleOptionToRemove.booking_schedule_option_id), { headers });
          await this.loadRefresh();
        } catch (error) {
          console.error('Error:', error);
          if (error.response && error.response.data.detail) {
            this.errorMessage = error.response.data.detail;
          } else {
            this.errorMessage = 'Unable to remove booking-schedule-option';
          }
          this.showErrorAlert = true;
        } finally {
          this.updateUnderway = false;
        }
      },
      getRowPropsForBookingScheduleOption(data) {
        return {
          'class': {
            'highlight-selected-row': data.item.current_status == 'selected'
          }
        }
      }   
    },
    async mounted() {
        this.code = this.$route.path.replace("/", "");
        await this.loadRefresh();
    }
};
</script>
<style>

.highlight-selected-row {
  background-color: #c5ffb5;
}
</style>
