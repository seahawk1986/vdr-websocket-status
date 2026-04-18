<script setup lang="ts">
  import { computed } from 'vue'
  import { useDate } from 'vuetify'
  import DateTime from '@/components/DateTime.vue'
  import MarqueeText from '@/components/MarqueeText.vue'
  import TvStatusSymbols from '@/components/TvStatusSymbols.vue'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const date = useDate()

  const currentStartDate = computed(() => {
    if (store.currentEvent?.start) {
      const d = new Date(store.currentEvent.start * 1000)
      return d
    }
    return null
  })


  const followingStartDate = computed(() => {
    if (store.nextEvent?.start) {
      const d = new Date(store.nextEvent.start * 1000)
      return d
    }
    return null
  })


</script>

<!-- nobanzai template begin { -->
<template>
  <v-card
    class="elevation-0 bg-black pa-0 ma-0"
    style="overflow: hidden !important; position: fixed; top: 0;
           left: 0; width: 100vw; height: 100vh; font-family: sans-serif;"
    tile
    variant="flat"
  >
    <v-row
      class="pa-2 px-6 pb-0 flex-shrink-0"
      no-gutters
      style="height: 26vh;"
    >
      <v-col
        class="pa-0 d-flex align-center justify-center"
        cols="4"
      >
        <v-img
          contain
          height="24vh"
          position="left center"
          :src="`http://${store.baseUrl}${store.channelLogo}`"
          style="filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) brightness(1.1);"
          width="100%"
        />
      </v-col>
      <v-col class="pa-0 pt-4 d-flex flex-column align-end" cols="8">
        <div class="font-weight-black text-uppercase text-right w-100 channel-font">
          <MarqueeText :content="store.currentChannelName">
            {{ store.currentChannelName }}
          </MarqueeText>
        </div>
        <v-divider
          class="mt-6 opacity-100"
          color="primary"
          style="width: 100% !important; border-opacity: 1 !important;"
          thickness="8"
        />
      </v-col>
    </v-row>

    <div
      class="d-flex flex-column justify-center px-10 flex-grow-1"
      style="height: 58vh; width: 100%;"
    >
      <v-row align="center" no-gutters>
        <v-col class="epg-font-main font-weight-black time-col" cols="auto">
          {{ date.format(currentStartDate, 'fullTime24h') }}
        </v-col>
        <v-divider class="mx-8 v-sep" thickness="6" vertical />
        <v-col class="overflow-hidden">
          <div class="epg-font-main font-weight-black text-truncate">
            <MarqueeText :content="store.currentEvent?.title">
              {{ store.currentEvent?.title ?? "no information" }}
            </MarqueeText>
          </div>
        </v-col>
      </v-row>

      <v-progress-linear
        v-if="store.currentEvent"
        v-model="store.currentEvent.progress"
        class="my-1"
        color="primary"
        height="20"
        rounded
      />

      <v-row align="center" class="opacity-70" no-gutters>
        <v-col class="epg-font-next font-weight-bold time-col" cols="auto">
          {{ date.format(followingStartDate, 'fullTime24h') }}
        </v-col>
        <v-divider class="mx-8 v-sep-small" thickness="6" vertical />
        <v-col class="overflow-hidden">
          <div class="epg-font-next font-weight-bold text-truncate">
            <MarqueeText :content="store.nextEvent?.title">
              {{ store.nextEvent?.title ?? "no information" }}
            </MarqueeText>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-row
      class="px-6 pb-2 align-center flex-shrink-0"
      no-gutters
      style="height: 16vh; position: absolute; bottom: 0; width: 100%;
             border-top: 1px solid #555555 !important;"
    >
      <v-col cols="6">
        <tv-status-symbols class="d-flex ga-10 status-icons" />
      </v-col>
      <v-col class="d-flex justify-end pr-0" cols="6">
        <div class="clock-font font-weight-black text-uppercase text-right">
          <date-time format="fullTime24h" />
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.channel-font { font-size: 6.8vw !important; line-height: 1.0; }
.epg-font-main { font-size: 6.2vw !important; line-height: 1.1; }
.epg-font-next { font-size: 5.2vw !important; line-height: 1.1; }
.time-col { min-width: 18vw; text-align: center; }

.clock-font {
  font-size: 6.8vw !important;
  line-height: 1.0;
  letter-spacing: 0px;
}

.v-sep { height: 9vh !important; align-self: center; border-color: white !important; }
.v-sep-small { height: 6.5vh !important; align-self: center; }

:deep(.v-divider) { border-style: solid !important; opacity: 1 !important; }
.v-row { margin: 0 !important; }

.status-icons :deep(.v-icon), .status-icons :deep(img) {
  font-size: 6vw !important;
  width: 6vw !important;
  height: auto;
}
</style>
<!-- nobanzai template end } -->
