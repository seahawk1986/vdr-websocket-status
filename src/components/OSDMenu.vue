<template>
  <v-dialog
    v-model="osd.visible"
    fullscreen
    scrim="black"
    transition="fade-transition"
  >
    <v-card class="d-flex flex-column rounded-0" color="background">
      <!-- Toolbar -->
      <v-toolbar color="blue-darken-3" density="compact" flat style="z-index: 10;">
        <v-toolbar-title class="text-mono">{{ osd.title || 'VDR Menü' }}</v-toolbar-title>
        <v-spacer />
        <!-- <v-btn icon="mdi-close" @click="osd.visible = false" /> -->
      </v-toolbar>

      <!-- Scroll-Container (Native div für zuverlässigen querySelector) -->
      <v-sheet
        v-if="osd.items.length == 1"
        ref="containerRef"
        class="overflow-hidden d-flex align-center justify-center mx-4"
        flat
        height="100%"
        style="font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;"
      >
        <div
          ref="contentRef"
          :class="['text-center', { 'marquee-active': isOverflowing }]"
          :style="marqueeStyle"
        >
          {{ osd.items[0] }}
          <!-- Zweiter Durchlauf (nur wenn Overflow) -->
          <template v-if="isOverflowing">
            <v-divider />
            <div class="pa-4">{{ osd.items[0] }}</div>
          </template>
        </div>
      </v-sheet>
      <v-card-text v-else ref="scrollContainer" class="pa-0 flex-grow-1 overflow-y-auto">
        <v-list bg-color="background" class="osd-list" density="compact">
          <v-list-item
            v-for="(item, index) in osd.items"
            :key="index"
            :active="osd.focusIndex === index"
            active-class="v-list-item--active-solid"
            class="text-mono opacity-100"
            color="blue"
            :data-index="index"
          >
            <template #prepend>
              <!-- <span class="text-grey mr-4 font-weight-light" style="width: 25px">
                {{ index + 1 }}
              </span> -->
            </template>
            <v-list-item-title :class="osd.focusIndex === index ? 'text-black font-weight-bold' : 'text-white'">{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <!-- Farbtasten-Footer -->
      <v-footer class="pa-2 bg-grey-darken-3 flex-grow-0" height="10vh">
        <v-row no-gutters>
          <v-col v-for="(label, colorName) in osd.helpKeys" :key="colorName" class="px-1">
            <v-btn
              v-if="label"
              block
              class="text-caption font-weight-bold"
              :color="colorName"
              size="small"
              variant="flat"
            >
              {{ label }}
            </v-btn>
          </v-col>
        </v-row>
      </v-footer>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useOsdStore } from '@/stores/osd'

  const osd = useOsdStore()
  const scrollContainer = ref(null) // OSD list scroll

  const containerRef = ref(null)
  const contentRef = ref(null)
  const isOverflowing = ref(false)
  const contentHeight = ref(0)

  async function checkOverflow () {
    await nextTick()
    if (containerRef.value?.$el && contentRef.value) {
      const containerH = containerRef.value.$el.clientHeight
      const contentH = contentRef.value.scrollHeight

      contentHeight.value = contentH
      // Nur scrollen, wenn Text höher als der Container ist
      isOverflowing.value = contentH > containerH
    }
  }

  // Berechnet die Animations-Distanz dynamisch
  const marqueeStyle = computed(() => {
    if (!isOverflowing.value) return { display: 'flex', alignItems: 'center', height: '100%', white_space: 'pre-line' }

    // GESCHWINDIGKEIT: 50 Pixel pro Sekunde (kleiner = schneller, größer = langsamer)
    const speedFactor = 25
    const duration = contentHeight.value / speedFactor

    return {
      '--content-height': `${contentHeight.value}px`,
      'animation-duration': `${duration}s`,
    }
  })

  // Automatisches Scrollen via querySelector
  watch(() => osd.focusIndex, async newIndex => {
    if (newIndex < 0 || !osd.visible) return

    await nextTick()

    // Container finden (v-card-text ist eine Komponente, daher $el)
    const container = scrollContainer.value?.$el || scrollContainer.value
    if (container) {
      const activeEl = container.querySelector(`[data-index="${newIndex}"]`)
      if (activeEl) {
        // 'center' hält das Item immer schön mittig im Viewport
        activeEl.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        })
      }
    }
  })

  onMounted(checkOverflow)
  watch(() => osd.items[0], checkOverflow)

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
}

  .description-text {

  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  white-space: pre-line; /* allow line breaks */
  }

.marquee-active {
  position: absolute;
  top: 0;
  left: 0;
  animation: scrollContinuous linear infinite;
}

@keyframes scrollContinuous {
  0% {
    transform: translateY(0);
  }
  100% {
    /* Wir springen zurück, sobald die erste Hälfte (Originaltext) oben raus ist */
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
</style>
