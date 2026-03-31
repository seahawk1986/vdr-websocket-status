<template>
  <v-sheet class="text-fluid-display elevation-0 d-flex flex-column align-center justify-center h-100 w-100 bg-background">
    <div class="d-flex align-center flex-nowrap">
      {{ currentTimeString }}
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { useDate } from 'vuetify'

  const date = useDate()

  const currentTime = ref(new Date())
  function updateCurrentTime () {
    currentTime.value = new Date()
  }
  const updateTimeInterval = setInterval(updateCurrentTime, 1000)
  onBeforeUnmount(() => {
    clearInterval(updateTimeInterval)
  })

  const currentTimeString = computed(() => {
    return date.format(currentTime.value, 'fullDateTime24h')
  })
</script>

<style scoped>
  /* Globale Skalierung für Titel und Inhalte */
  .text-fluid-display :deep(*) {
  font-size: clamp(1.0rem, 5vw + 0.5rem, 6rem) !important;
  line-height: 1.3 !important;
  }

  /* Speziell für die Beschreibung (etwas kleiner als der Titel) */
  .description-text {
  /* Min: 1.2rem, Skalierung: 3vw, Max: 4rem */

  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  opacity: 0.9;
  white-space: normal; /* Erlaubt Zeilenumbrüche */
  }

  /* Container-Begrenzung für vertikales Scrollen */
  .description-container {
  /* Setze hier eine feste Höhe oder nutze Flexbox-Werte */
  max-height: 60vh;
  scrollbar-width: thin; /* Für Firefox */
  }

  /* Scrollbar-Styling für Chrome/Edge/Safari */
  .description-container::-webkit-scrollbar {
  width: 8px;
  }
  .description-container::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
  }
</style>
