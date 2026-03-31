<script setup lang="ts">
  import { computed } from 'vue'
  import { useDate } from 'vuetify'
  import { useAppStore } from '@/stores/app'
  import MarqueeText from './MarqueeText.vue'
  const store = useAppStore()
  const date = useDate()

  const currentStartDate = computed(() => {
    if (store.currentEvent?.start) {
      const d = new Date(store.currentEvent.start * 1000)
      return d
    }
    return null
  })
  const currentEndDate = computed(() => {
    if (store.currentEvent?.duration && store.currentEvent?.start) {
      const endDate = new Date(store.currentEvent.start * 1000 + store.currentEvent.duration * 1000)
      return endDate
    } else {
      return null
    }
  })
  const followingStartDate = computed(() => {
    if (store.nextEvent?.start) {
      const d = new Date(store.nextEvent.start * 1000)
      return d
    }
    return null
  })

  const followingEndDate = computed(() => {
    if (store.nextEvent?.duration && store.nextEvent?.start) {
      const endDate = new Date(store.nextEvent.start * 1000 + store.nextEvent.duration * 1000)
      return endDate
    } else {
      return null
    }
  })

</script>

<template>
  <!-- h-100 and flex-grow-1 the the card grow to the footer -->
  <v-card
    class="text-fluid-display elevation-0 d-flex flex-column justify-center h-100 w-100 bg-background"
    variant="flat"
  >
    <div class="content-wrapper">

      <!-- channel info (number & name) -->
      <v-card-item class="bg-transparent py-4">
        <template #prepend>
          <div class="d-flex align-center flex-nowrap mr-4">
            <v-img
              aspect-ratio="16/9"
              max-height="25vh"
              :src="`http://${store.baseUrl}${store.channelLogo}`"
              :width="300"
            />
            <!-- {{ store.currentChannelNumber }} -->

            <!-- <v-divider class="mx-6" opacity="0.3" thickness="4" vertical /> -->
          </div>
        </template>
        <v-card-title class="font-weight-bold pa-0 text-uppercase">
          <MarqueeText class="flex-grow-1" :content="store.currentChannelName">
            {{ store.currentChannelName }}
          </MarqueeText>
          <v-divider />
        </v-card-title>
        <!-- channel properties and status items-->
        <v-card-title class="hide-sm-and-below">
          <div class="d-flex align-center justify-space-around">

            <v-icon :color="store.channelIsEncrypted ? 'warning' : 'grey-darken-2'" icon="mdi-key" />
            <v-icon :color="store.channelAudioTracksCount > 1 ? 'warning' : 'grey-darken-2'" icon="mdi-soundbar" />
            <v-icon :color="store.channelHasDolby ? 'warning' : 'grey-darken-2'" icon="mdi-dolby" />
            <v-icon :color="store.channelHasTeletext ? 'warning' : 'grey-darken-2'" icon="mdi-card-text-outline" />
            <v-icon
              :class="store.is_recording ? 'recording-pulse' : ''"
              :color="store.is_recording ? 'red' : 'grey-darken-2'"
              icon="mdi-record"
              size="x-large"
            />
          </div>
        </v-card-title>
      </v-card-item>

      <v-card-text class="bg-transparent">
        <div class="d-flex flex-column">

          <!-- current event -->
          <v-sheet class="pa-0 bg-transparent">
            <div class="d-flex align-center overflow-hidden">
              <div class="flex-shrink-0 opacity-80 time-width">
                {{ date.format(currentStartDate, 'fullTime24h') }} - {{ date.format(currentEndDate, 'fullTime24h') }}
              </div>
              <v-divider class="mx-6" opacity="0.3" thickness="4" vertical />
              <MarqueeText class="flex-grow-1" :content="store.currentEvent?.title">
                {{ store.currentEvent?.title }}
              </MarqueeText>
            </div>
          </v-sheet>

          <v-progress-linear
            v-if="store.currentEvent"
            v-model="store.currentEvent.progress"
            class="my-4 mx-0"
            color="primary"
            height="18"
            rounded
          />

          <!-- following event -->
          <v-sheet class="pa-0 bg-transparent">
            <div class="d-flex align-center overflow-hidden">
              <div class="flex-shrink-0 opacity-50 time-width">
                {{ date.format(followingStartDate, 'fullTime24h') }} - {{ date.format(followingEndDate, 'fullTime24h') }}
              </div>
              <v-divider class="mx-6" opacity="0.3" thickness="4" vertical />
              <MarqueeText class="flex-grow-1" :content="store.nextEvent?.title">
                {{ store.nextEvent?.title }}
              </MarqueeText>
            </div>
          </v-sheet>

        </div>
      </v-card-text>
    </div>
  </v-card>
</template>

<style scoped>
.text-fluid-display :deep(*) {
  font-size: clamp(1.2rem, 5vw + 0.5rem, 6rem) !important;
  line-height: 1.3 !important;
}
/* fill v-main */
.h-100 {
  height: 100% !important;
  min-height: 100%;
}

/* wrapand center contents */
.content-wrapper {
  width: 100%;
  /*max-width: 1800px; /* Optional: limit for Ultra-Wide Screens */
  margin: 0 auto;
  padding: 0 0vw; /* padding */
}

/* Divider-Höhe an die (große) Schrift anpassen */
:deep(.v-divider--vertical) {
  height: 1.5em !important;
  align-self: center;
}

/* Zeitspalte etwas breiter für das große Layout */
.time-width {
  min-width: 6ch;
  text-align: center;
}

/* Optional: Ein pulsierender Effekt für das "Aufnahme"-Gefühl */
.recording-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.1; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
