<script setup lang="ts">
  import { computed } from 'vue'
  import { useDate } from 'vuetify'
  import DateTime from '@/components/DateTime.vue'
  import MarqueeText from '@/components/MarqueeText.vue'
  import { useAppStore } from '@/stores/app'

  const dateFormatter = useDate()
  const store = useAppStore()

  function formattedDuration (duration: number) {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60

    const m = minutes.toString().padStart(2, '0')
    const s = seconds.toString().padStart(2, '0')

    return `${hours}:${m}:${s}`
  }

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

  const startTime = computed(() => {
    if (store.replayRecording) {
      const startDate = new Date(store.replayRecording?.start * 1000)
      return dateFormatter.format(startDate, 'fullTime24h')
    } else return null
  })

  const endTime = computed(() => {
    if (store.replayRecording) {
      const endDate = new Date((store.replayRecording.start + store.replayRecording.duration) * 1000)
      return dateFormatter.format(endDate, 'fullTime24h')
    } else return null
  })

  const elapsedTime = computed(() => {
    return formattedDuration(store.replayPosition)
  })

  const remainingTime = computed(() => {
    const remainingSeconds = store.replayPositionTotal - store.replayPosition
    return formattedDuration(remainingSeconds)
  })
  const endWallTime = computed(() => {
    const remainingSeconds = store.replayPositionTotal - store.replayPosition
    const d = new Date(Date.now() + remainingSeconds * 1000)
    return dateFormatter.format(d, 'fullTime24h')
  })
</script>

<template>
  <v-card
    class="text-fluid-display opacity-80 elevation-0 d-flex flex-column fill-height bg-background"
    variant="flat"
  >
    <v-card-item class="flex-shrink-0">
      <template #title>
        <div class="d-flex w-100 flex-shrink-0" style="min-width: 0;">
          <v-sheet class="pa-2 bg-transparent  flex-grow-1" style="min-width: 0;">
            <MarqueeText :content="store.replayName">
              {{ store.replayName }}
            </MarqueeText>
            <MarqueeText v-if="store.replayShortText.length > 0" :content="store.replayShortText">
              {{ store.replayShortText }}
            </MarqueeText>
            <!-- <MarqueeText color="green">
              Aufnahmezeit: {{ startTime }} - {{ endTime }}
            </MarqueeText>
            <MarqueeText color="red">
              Wiedergabeende: {{ endWallTime }}
            </MarqueeText>
            <MarqueeText color="yellow">
            </MarqueeText> -->
            <div class="d-flex align-center">
              <div>{{ elapsedTime }}</div>
              <v-divider
                class="align-center"
                color="primary"
                gradient
                opacity=".7"
                thickness="12"
                variant="dotted"
              />
              <div :style="{ fontSize: 'clamp(3rem, 5vw, 7rem)' }">
                <v-icon :icon="replayIcon" />
              </div>
              <v-divider
                class="align-center"
                color="primary"
                gradient
                opacity=".7"
                thickness="12"
                variant="dotted"
              />
              <div>{{ remainingTime }}</div>
            </div>

          </v-sheet>
        </div>
        <v-progress-linear
          v-model="store.replayProgress"
          class="mb-6"
          color="primary"
          height="15"
          rounded
        />
      </template>
    </v-card-item>

    <v-card-text class="flex-grow-1 overflow-hidden pa-0">
      <div class="description-container h-100 overflow-y-auto px-4">
        <div class="description-text">
          {{ store.replayRecording?.description }}
        </div>
      </div>
    </v-card-text>

    <Teleport defer to="#footer-actions">
      <v-sheet class="d-flex justify-space-evenly align-center opacity-80 bg-background px-4 pb-0 pt-0 flex-grow-1 w-100">
        <!-- <div :style="{ fontSize: 'clamp(3rem, 5vw, 7rem)' }">
          <v-icon :icon="replayIcon" />
        </div> -->
        <date-time format="fullDateTime24h" />
      </v-sheet>
    </Teleport>
  </v-card>
</template>

<style scoped>
.h-100 {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.description-text {
  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  opacity: 0.9;
  white-space: normal;
}

.text-fluid-display :deep(*) {
  font-size: clamp(1.2rem, 6vw + 0.5rem, 6rem) !important;
  line-height: 1.3 !important;
}

.description-text {
  /* Min: 1.2rem, Skalierung: 3vw, Max: 4rem */

  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  opacity: 0.9;
  white-space: normal; /* allows reflow */
}

.description-container {
  scrollbar-width: thin;
}

/* Scrollbar styling for Chrome/Edge/Safari */
.description-container::-webkit-scrollbar {
  width: 8px;
}
.description-container::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}
</style>
