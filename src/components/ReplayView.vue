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

    <v-card-text
      ref="containerRef"
      class="overflow-hidden d-flex align-start justify-start mx-4"
      flat
      height="100%"
    >
      <div
        ref="contentRef"
        :class="['text-left', 'description-text', { 'marquee-active': isOverflowing }]"
        :style="marqueeStyle"
      >
        {{ store.replayRecording?.description }}
        <!-- Zweiter Durchlauf -->
        <template v-if="isOverflowing">
          <v-divider class="my-4" />
          <div class="pa-0" style="font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;">{{ store.replayRecording?.description }}</div>
        </template>
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

<script setup lang="ts">
  import { computed, type CSSProperties, nextTick, onMounted, ref, watch } from 'vue'
  import { useDate } from 'vuetify'
  import DateTime from '@/components/DateTime.vue'
  import MarqueeText from '@/components/MarqueeText.vue'
  import { useAppStore } from '@/stores/app'

  const dateFormatter = useDate()
  const store = useAppStore()

  const containerRef = ref<any>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const isOverflowing = ref(false)
  const contentHeight = ref(0)

  const marqueeStyle = computed((): CSSProperties => { // Typ hier zuweisen
    if (!isOverflowing.value) {
      return {
        display: 'block',
        textAlign: 'left', // Nutze konsistent CamelCase für CSSProperties
        width: '100%',
        whiteSpace: 'pre-line',
      }
    }
    const speedFactor: number = store.scrollSpeed
    const duration = (contentHeight.value * 2) / speedFactor

    return {
      '--content-height': `${contentHeight.value}px`,
      'animationDuration': `${duration}s`,
      'animationDelay': '1s',
      'animationFillMode': 'both',
      'whiteSpace': 'pre-line',
      'textAlign': 'left',
      'width': '100%',
      'font-size': 'clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important'
    } as CSSProperties // "as CSSProperties" hilft bei den Custom-Properties (--content-height)
  })

  async function checkOverflow() {
    await nextTick()
    const container = containerRef.value?.$el || containerRef.value
    const content = contentRef.value

    if (container && content) {
      const containerH = container.clientHeight
      // Wir messen im "statischen" Zustand (bevor isOverflowing true wird)
      const contentH = content.scrollHeight

      if (contentH > containerH + 2) {
        // WICHTIG: Die Strecke muss Inhalt + Abstand sein
        // Falls der Divider my-4 hat, sind das 16px.
        // Wir setzen diesen Wert als EINE Einheit für den Loop.
        contentHeight.value = contentH + 16
        isOverflowing.value = true
      } else {
        isOverflowing.value = false
      }
    }
  }

  watch(
    () => store.replayRecording?.description,
    async newContent => {
      isOverflowing.value = false
      if (newContent) {
        await nextTick()
        checkOverflow()
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    window.addEventListener('resize', checkOverflow)
  })

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

<style scoped>
.h-100 {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.description-text :deep(*) {
  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  opacity: 0.9;
  white-space: pre-line;
  line-height: 1.0
}

.text-fluid-display :deep(*) {
  font-size: clamp(1.2rem, 6vw + 0.5rem, 6rem) !important;
  line-height: 1.3 !important;
}

.description-container {
  scrollbar-width: thin;
}

.description-container::-webkit-scrollbar {
  width: 8px;
}
.description-container::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

.overflow-hidden {
  position: relative;
  overflow: hidden;
}

@keyframes scrollContinuous {
  /* Während des Delays bleibt die Animation bei 0% stehen */
  0%, 10% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.marquee-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* Entferne animation-fill-mode: both für Endlos-Loops,
     linear ist wichtig für die Gleichmäßigkeit */
  animation-name: scrollContinuous;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
</style>
