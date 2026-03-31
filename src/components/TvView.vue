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
  const followingStartDate = computed(() => {
    if (store.nextEvent?.start) {
      const d = new Date(store.nextEvent.start * 1000)
      return d
    }
    return null
  })

</script>

<template>
  <!-- h-100 und flex-grow-1 sorgen dafür, dass die Card den Raum bis zum Footer füllt -->
  <v-card
    class="text-fluid-display elevation-0 d-flex flex-column justify-center h-100 w-100 bg-background"
    variant="flat"
  >
    <div class="content-wrapper">

      <!-- Kanal-Info (Nummer & Name) -->
      <v-card-item class="bg-transparent py-6">
        <template #prepend>
          <div class="d-flex align-center flex-nowrap">
            {{ store.currentChannelNumber }}
            <v-divider class="mx-6" opacity="0.3" thickness="4" vertical />
          </div>
        </template>
        <v-card-title class="font-weight-bold pa-0 text-uppercase">
          {{ store.currentChannelName }}
        </v-card-title>
      </v-card-item>

      <v-card-text class="bg-transparent">
        <div class="d-flex flex-column">

          <!-- Aktuelles Event -->
          <v-sheet class="pa-4 bg-transparent">
            <div class="d-flex align-center overflow-hidden">
              <div class="flex-shrink-0 opacity-80 time-width">
                {{ date.format(currentStartDate, 'fullTime24h') }}
              </div>
              <v-divider class="mx-6" opacity="0.3" thickness="4" vertical />
              <MarqueeText class="flex-grow-1" :content="store.currentEvent?.title">
                {{ store.currentEvent?.title }}
              </MarqueeText>
            </div>
          </v-sheet>

          <!-- Fortschrittsbalken mit mehr Margin für das Fullscreen-Layout -->
          <v-progress-linear
            v-if="store.currentEvent"
            v-model="store.currentEvent.progress"
            class="my-4 mx-0"
            color="primary"
            height="18"
            rounded
          />

          <!-- Nächstes Event -->
          <v-sheet class="pa-4 bg-transparent">
            <div class="d-flex align-center overflow-hidden">
              <div class="flex-shrink-0 opacity-50 time-width">
                {{ date.format(followingStartDate, 'fullTime24h') }}
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
/* Füllt den Bereich innerhalb von v-main komplett aus */
.h-100 {
  height: 100% !important;
  min-height: 100%;
}

/* Container, der alle Inhalte umschließt und in der Mitte hält */
.content-wrapper {
  width: 100%;
  max-width: 1800px; /* Optional: Begrenzung für Ultra-Wide Screens */
  margin: 0 auto;
  padding: 0 5vw; /* Seitlicher Abstand basierend auf Fensterbreite */
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
</style>
