<template>
  <v-dialog
    v-model="osdStore.visible"
    fullscreen
    scrim="black"
    transition="fade-transition"
  >
    <v-card class="d-flex flex-column rounded-0" color="background">
      <!-- Toolbar -->
      <v-toolbar color="blue-darken-3" density="compact" flat style="z-index: 10;">
        <v-toolbar-title>{{ osdStore.osd.title || 'VDR Menü' }}</v-toolbar-title>
        <v-spacer />
      </v-toolbar>

      <v-card-text v-if="osdStore.osd.mode === 'list'" ref="scrollContainer" class="pa-0 flex-grow-1 overflow-y-auto">
        <div class="d-flex flex-column" style="height: 100%; min-height: 0;">

          <v-virtual-scroll
            ref="virtualScroll"
            bg-color="background"
            class="osd-list"
            density="compact"
            :items="osdStore.osd.items"
          >
            <template #default="{ item, index }">
              <v-list-item
                :id="osdStore.osd.index === index ? 'active-osd-item' : undefined"
                :key="index"
                :active="osdStore.osd.index === index"
                active-class="v-list-item--active-solid"
                class="text-mono"
                color="blue"
                :data-index="index"
                :disabled="!item.selectable"
              >
                <!-- <template #title>
                  <div :class="osdStore.osd.index === index ? 'font-weight-bold text-white' : 'text-white'">
                    {{ item.value }}
                  </div>
                </template> -->
                <template #title>
                  <div
                    :class="[
                      'd-flex',
                      osdStore.osd.index === index ? 'font-weight-bold text-white' : 'text-white'
                    ]"
                  >
                    <!-- Wir splitten den Text am Tabulator-Zeichen -->
                    <span
                      v-for="(part, pIndex) in item.value.split('\t')"
                      :key="pIndex"
                      :class="['osd-column', `col-${pIndex}`]"
                    >
                      {{ part }}
                    </span>
                  </div>
                </template>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </div>

      </v-card-text>

      <v-card-text
        v-else
        ref="containerRef"
        class="overflow-hidden d-flex align-start justify-start mx-4"
        flat
        height="100%"
        style="font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;"
      >
        <div
          ref="contentRef"
          :class="['text-left', { 'marquee-active': isOverflowing }]"
          :style="marqueeStyle"
        >
          {{ osdStore.osd.content }}
          <!-- Zweiter Durchlauf -->
          <template v-if="isOverflowing">
            <v-divider class="my-4" />
            <div class="pa-0">{{ osdStore.osd.content }}</div>
          </template>
        </div>
      </v-card-text>

      <!-- Farbtasten-Footer -->
      <v-footer class="pa-2 bg-grey-darken-3 flex-grow-0" height="10vh">
        <v-row no-gutters>
          <v-col v-for="(colorName) in colorKeys" :key="colorName" class="px-1">
            <v-btn
              block
              class="text-caption font-weight-bold"
              :color="colorName"
              size="small"
              variant="flat"
            >
              {{ osdStore.osd.keys[colorName] }}
            </v-btn>
          </v-col>
        </v-row>
      </v-footer>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useOsdStore } from '@/stores/osd'

  const appStore = useAppStore()
  const osdStore = useOsdStore()
  const scrollContainer = ref(null) // OSD list scroll
  const virtualScroll = ref(null)

  const containerRef = ref(null)
  const contentRef = ref(null)
  const isOverflowing = ref(false)
  const contentHeight = ref(0)

  const colorKeys = ['red', 'green', 'yellow', 'blue']

  // For the OsdItemText elements
  async function checkOverflow () {
    await nextTick()
    // Nutze $el bei Vuetify-Komponenten (v-card-text)
    const container = containerRef.value?.$el || containerRef.value
    const content = contentRef.value

    if (container && content) {
      const containerH = container.clientHeight
      const contentH = content.scrollHeight

      // Nur wenn der Inhalt wirklich größer als der Platz ist (+ Puffer)
      if (contentH > containerH + 2) {
        contentHeight.value = contentH
        isOverflowing.value = true
      } else {
        isOverflowing.value = false
      }
    }
  }

  watch(
    () => [osdStore.osd.content, osdStore.visible, osdStore.osd.mode],
    async ([content, visible, mode]) => {
      if (visible && mode === 'text') {
        // 1. Erstmal alles zurücksetzen, um die Animation zu stoppen
        isOverflowing.value = false
        contentHeight.value = 0

        if (content) {
          // 2. Warten, bis Vue den neuen Text in das DOM gezeichnet hat
          await nextTick()
          // 3. Jetzt erst messen
          checkOverflow()
        }
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    window.addEventListener('resize', checkOverflow)
  })

  // compute the animation distance dynamically
  const marqueeStyle = computed(() => {
    if (!isOverflowing.value) {
      return {
        display: 'block',
        textAlign: 'left',
        width: '100%',
        whiteSpace: 'pre-line',
      }
    }

    const speedFactor = appStore.scollSpeed
    const duration = (contentHeight.value * 2) / speedFactor

    return {
      '--content-height': `${contentHeight.value}px`,
      'animation-duration': `${duration}s`,
      'animation-delay': '1s', // wait for 1 seconds before scrolling
      'animation-fill-mode': 'both', // Wichtig, damit der Text am Anfang stehen bleibt
      'white-space': 'pre-line',
      'text-align': 'left',
      'width': '100%',
    }
  })

  watch(() => osdStore.osd.index, newIndex => {
    if (newIndex !== undefined && newIndex >= 0) {
      // soft scrolling
      virtualScroll.value?.scrollToIndex(newIndex)
    }
  })

  const ITEM_HEIGHT = 40 // Feste Höhe bei density="compact"

  watch(() => osdStore.osd.index, newIndex => {
    if (newIndex !== undefined && newIndex >= 0 && virtualScroll.value) {
      // 1. Hole die aktuelle Höhe des v-virtual-scroll Containers ($el)
      const containerHeight = virtualScroll.value.$el.clientHeight

      if (containerHeight > 0) {
        // 2. Berechne, wie viele Items reinpassen
        const visibleItemsCount = Math.floor(containerHeight / ITEM_HEIGHT)

        // 3. Berechne den Offset für die Mitte
        const centerOffset = Math.floor(visibleItemsCount / 2)

        // 4. Ziel-Index nach oben schieben, damit Fokus mittig landet
        const targetIndex = Math.max(0, newIndex - centerOffset)

        virtualScroll.value.scrollToIndex(targetIndex)
      } else {
        // Fallback, falls die Höhe (noch) 0 ist (z.B. beim ersten Öffnen)
        virtualScroll.value.scrollToIndex(newIndex)
      }
    }
  })
</script>

<style scoped>
.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace !important;
}
.osd-list {
  overflow-x: hidden;
}
.v-list-item-title {
  white-space: nowrap !important;
  font-size: 0.95rem;
}
/* Optional: Fokus-Balken etwas deutlicher machen */
.v-list-item--active {
  background-color: rgba(255, 255, 0, 0.1) !important;
  color: rgba(255, 255, 255, 0, 1) !important;
}

  .description-text {

  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  white-space: pre-line; /* allow line breaks */
  }

/* Container für den Text-Modus */
.overflow-hidden {
  position: relative; /* Wichtig für absolute Positionierung des Marquees */
  overflow: hidden;
}

.marquee-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* Hier kein festes animation-delay, da wir es dynamisch via JS setzen */
  animation-name: scrollContinuous;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  text-align: left !important;
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

@keyframes scrollDown {
  0% { transform: translateY(100%); }
  100% { transform: translateY(calc(-1 * var(--content-height))); }
}

/* Verhindert Flackern vor der Berechnung */
div:not(.marquee-active) {
  max-width: 100%;
}

.v-list-item--active-solid {
  background-color: #2196F3 !important; /* Dein kräftiges Blau */
  opacity: 1 !important;
}

.osd-column {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 16px; /* Abstand zwischen Spalten */
}

/* Optionale feste Breiten für typische VDR-Listen (Kanalnummer, Name, Zeit) */
.col-0 { flex-grow: 0; }  /* Kanalnummer */
.col-1 { flex-grow: 0; }  /* Sendername */
.col-2 { flex-grow: 0; }  /* Uhrzeit */
.col-4 { flex-grow: 2; }  /* Sendungstitel */
</style>
