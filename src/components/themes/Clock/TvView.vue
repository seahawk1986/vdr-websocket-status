<script setup lang="ts">
  import { useDate } from 'vuetify'
  import DateTime from '@/components/DateTime.vue'
  import MarqueeText from '@/components/MarqueeText.vue'
  import TvStatusSymbols from '@/components/TvStatusSymbols.vue'
  import { useAppStore } from '@/stores/app'
  const store = useAppStore()
  const date = useDate()


</script>

<template>
  <!-- h-100 and flex-grow-1 the the card grow to the footer -->
  <v-card
    class="text-fluid-display elevation-0 d-flex flex-column justify-center h-100 w-100 bg-background"
    variant="flat"
  >
    <div class="content-wrapper">

      <v-card-item class="bg-transparent py-4">
        <template #append>
          <div class="d-flex align-center flex-nowrap mr-4">
            <v-img
              aspect-ratio="16/9"
              max-height="25vh"
              :src="`http://${store.baseUrl}${store.channelLogo}`"
              :width="300"
            />

          </div>
        </template>
        <v-card-title class="font-weight-bold pa-0 opacity-80  text-uppercase title-fluid-display">
          <div>
            <date-time format="fullTime24h" />
          </div>
        </v-card-title>
      </v-card-item>

      <v-card-text class="bg-transparent">
        <div class="d-flex flex-column">

          <MarqueeText class="flex-grow-1 opacity-80 " :content="store.currentChannelName">
            {{ store.currentChannelName }}
          </MarqueeText>
          <!-- current event -->
          <v-sheet class="pa-0 bg-transparent">
            <div class="d-flex align-center overflow-hidden">
              <div class="flex-shrink-0 opacity-80 time-width">
                {{ date.format(store.currentStartDate, 'fullTime24h') }}<template v-if="store.showEndTime"> - {{ date.format(store.currentEndDate, 'fullTime24h') }}</template>
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
            rounded
          />

          <!-- following event -->
          <v-sheet class="pa-0 bg-transparent">
            <div class="d-flex align-center overflow-hidden">
              <div class="flex-shrink-0 opacity-80 time-width">
                {{ date.format(store.followingStartDate, 'fullTime24h') }}<template v-if="store.showEndTime"> - {{ date.format(store.followingEndDate, 'fullTime24h') }}</template>
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

    <!-- Footer -->
    <Teleport defer to="#footer-actions">
      <v-sheet class="d-flex justify-space-around  align-center bg-background pa-0 flex-grow-1 w-100">

        <div :style="{ fontSize: 'clamp(3rem, 3vw, 5rem)' }">
          <tv-status-symbols />
        </div>
      </v-sheet>
    </Teleport>
  </v-card>
</template>

<style scoped>
.text-fluid-display :deep(*) {
  font-size: clamp(1.2rem, 3vw + 0.5rem, 6rem) !important;
  line-height: 1.3 !important;
}

.title-fluid-display :deep(*) {
  font-size: clamp(5rem, 18vw + 0.5rem, 20rem) !important;
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
