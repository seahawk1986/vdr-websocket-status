<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppStore } from '@/stores/app'
  import MarqueeText from './MarqueeText.vue'
  const store = useAppStore()

  const replayIcon = computed(() => {
    if (store.replaying) {
      switch (store.replaySpeed) {
        case -1: {
          return 'mdi-play'
        }
        case 1: {
          return store.replayDirectionForward ? 'mdi-chevron-right' : 'mdi-chevron-left'
        }
        case 2: {
          return store.replayDirectionForward ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'
        }
        case 3: {
          return store.replayDirectionForward ? 'mdi-chevron-triple-right' : 'mdi-chevron-triple-left'
        }
        default: {
          return 'mdi-help'
        }
      }
    } else {
      return 'mdi-pause'
    }
  })
</script>

<template>
  <v-card bg-background class="text-fluid-display elevation-0 d-flex flex-column h-100" variant="flat">
    <template #title>
      <!-- Die Kombination aus min-width: 0 und width: 100% ist hier entscheidend -->
      <div class="d-flex w-100" style="min-width: 0;">
        <v-sheet class="pa-2 bg-transparent flex-grow-1" style="min-width: 0;">
          <MarqueeText :content="store.replayName">
            {{ store.replayName }}
          </MarqueeText>
        </v-sheet>
      </div>
    </template>

    <template #text>
      <!-- 'flex-grow-1' füllt den Platz, 'overflow-y-auto' erlaubt Scrollen -->
      <div class="description-container overflow-y-auto pa-2">
        <v-progress-linear
          v-model="store.replayProgress"
          class="mb-6"
          color="primary"
          height="15"
          rounded
        />

        <div class="description-text">
          {{ store.replayRecording?.description }}
        </div>
      </div>
      <v-icon :icon="replayIcon" size="x-large" />
    </template>
  </v-card>
</template>

<style scoped>
/* Globale Skalierung für Titel und Inhalte */
.text-fluid-display :deep(*) {
  font-size: clamp(1.2rem, 6vw + 0.5rem, 6rem) !important;
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
