<script setup lang="ts">
  import { useAppStore } from '@/stores/app'
  const store = useAppStore()
</script>

<template>
  <div class="d-flex align-center justify-space-around">
    <v-icon :color="store.volume == 0 ? 'red' : 'grey-darken-2'" :icon="store.volume == 0 ? 'mdi-volume-off' : store.volume >= 100 ? 'mdi-volume-high' : 'mdi-volume-medium'" />
    <v-icon :color="store.channelIsEncrypted ? 'warning' : 'grey-darken-2'" icon="mdi-key" />
    <v-icon :color="store.channelAudioTracksCount > 1 ? 'warning' : 'grey-darken-2'" icon="mdi-soundbar" />
    <v-icon :color="store.channelHasDolby ? 'warning' : 'grey-darken-2'" icon="mdi-dolby" />
    <v-icon :color="store.channelHasTeletext ? 'warning' : 'grey-darken-2'" icon="mdi-card-text-outline" />
    <v-icon
      :class="store.is_recording ? 'recording-pulse' : ''"
      :color="store.is_recording ? 'red' : 'grey-darken-2'"
      icon="mdi-record-rec"
      size="x-large"
    />
  </div>
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
