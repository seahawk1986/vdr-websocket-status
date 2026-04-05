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

      <v-card-text
        v-if="osdStore.osd.mode === 'list'"
        class="pa-0 flex-grow-1 d-flex flex-column justify-center overflow-hidden"
      >
        <!-- Breite auf 100% zwingen -->
        <div
          class="osd-fixed-wrapper w-100"
          :style="{ height: (itemHeightPx * VISIBLE_COUNT) + 'px' }"
        >
          <v-virtual-scroll
            ref="virtualScroll"
            class="w-100"
            :height="itemHeightPx * VISIBLE_COUNT"
            :item-height="itemHeightPx"
            :items="osdStore.osd.items"
          >
            <template #default="{ item, index }">
              <v-list-item
                :key="index"
                :active="osdStore.osd.index === index"
                class="osd-item pa-0"
              >
                <div
                  class="osd-text-wrap text-white w-100"
                  :style="{
                    fontSize: dynamicFontSize,
                    '--col-count': item.value.split('\t').length
                  }"
                >
                  <span v-for="(part, pIndex) in item.value.split('\t')" :key="pIndex" :class="['osd-column', `col-${pIndex}`]">
                    {{ part }}
                  </span>
                </div>
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
              class="text-caption black--text font-weight-bold"
              :color="colorName"
              size="large"
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
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue' // onUnmounted fehlte oben!
  import { useAppStore } from '@/stores/app'
  import { useOsdStore } from '@/stores/osd'

  const appStore = useAppStore()
  const osdStore = useOsdStore()
  const virtualScroll = ref(null)

  const containerRef = ref(null)
  const contentRef = ref(null)
  const isOverflowing = ref(false)
  const contentHeight = ref(0)

  const colorKeys = ['red', 'green', 'yellow', 'blue']

  const VISIBLE_COUNT = 12
  const OFFSET = 5
  const itemHeightPx = ref(50)

  function updateLayout () {
    const available = window.innerHeight * 0.8
    itemHeightPx.value = Math.max(Math.floor(available / VISIBLE_COUNT), 30)
  }

  async function checkOverflow () {
    await nextTick()
    const container = containerRef.value?.$el || containerRef.value
    const content = contentRef.value
    if (container && content) {
      const containerH = container.clientHeight
      const contentH = content.scrollHeight
      if (contentH > containerH + 2) {
        contentHeight.value = contentH
        isOverflowing.value = true
      } else {
        isOverflowing.value = false
      }
    }
  }

  onMounted(() => {
    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('resize', checkOverflow)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateLayout)
    window.removeEventListener('resize', checkOverflow)
  })

  watch(() => osdStore.osd.index, newIndex => {
    if (newIndex !== undefined && newIndex >= 0 && virtualScroll.value) {
      const targetIndex = Math.max(0, newIndex - OFFSET)
      virtualScroll.value.scrollToIndex(targetIndex)
    }
  })

  const dynamicFontSize = computed(() => {
    // 60% der Zeilenhöhe als Schriftgröße
    return `${Math.floor(itemHeightPx.value * 0.75)}px`
  })

  watch(
    () => [osdStore.osd.content, osdStore.visible, osdStore.osd.mode],
    async ([content, visible, mode]) => {
      if (visible && mode === 'text') {
        isOverflowing.value = false
        contentHeight.value = 0
        if (content) {
          await nextTick()
          checkOverflow()
        }
      }
    },
    { immediate: true },
  )

  const marqueeStyle = computed(() => {
    if (!isOverflowing.value) {
      return { display: 'block', textAlign: 'left', width: '100%', whiteSpace: 'pre-line' }
    }
    const speedFactor = appStore.scollSpeed
    const duration = (contentHeight.value * 2) / speedFactor
    return {
      '--content-height': `${contentHeight.value}px`,
      'animation-duration': `${duration}s`,
      'animation-delay': '1s',
      'animation-fill-mode': 'both',
      'white-space': 'pre-line',
      'text-align': 'left',
      'width': '100%',
    }
  })
</script>

<style scoped>
.osd-item :deep(.v-list-item__overlay) {
  display: none !important;
}

.osd-item.v-list-item--active {
  background-color: #2196F3 !important;
  opacity: 1 !important;
}

.osd-item :deep(.v-list-item__content) {
  padding: 0 !important;
  margin: 0 !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important; /* Vertikale Zentrierung */
}

.osd-item {
  width: 100% !important; /* Markierung geht über die volle Breite */
  height: calc(v-bind(itemHeightPx) * 1px) !important;
  display: flex !important;
  align-items: center !important;
  padding: 10 !important; /* OSD-typischer Seitenabstand */
  box-sizing: border-box;
}

.osd-fixed-wrapper {
  width: 100% !important; /* Volle Breite erzwingen */
  height: calc(v-bind(itemHeightPx) * 10 * 1px) !important;
  overflow: hidden;
}

/* Fokus-Balken bündig machen */
.osd-item.v-list-item--active {
  background-color: #2196F3 !important;
  opacity: 1 !important;
}

.osd-text-wrap {
  display: grid !important;
  /* Dynamische Spalten: Alle Spalten außer der letzten sind 'min-content' (so breit wie nötig),
     die letzte Spalte ist immer '1fr' (nimmt den Rest). */
  grid-template-columns: repeat(calc(var(--col-count, 1) - 1), min-content) 1fr;

  align-items: center;
  gap: 1.5rem; /* Sauberer Abstand zwischen den Spalten */
  width: 100%;
  padding: 24px 24px;
  font-family: 'Roboto Mono', monospace !important;
}

/* Spalten-Layout stabilisieren */

.osd-column {
  white-space: nowrap; /* WICHTIG: Erhält die VDR-eigenen Leerzeichen */
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3; /* enough space around font */
  padding-left: 1ch;
}
/* Spezielle Ausrichtung für EPG-Daten (4 Spalten) */
.osd-text-wrap[style*="--col-count: 4"] .col-0,
.osd-text-wrap[style*="--col-count: 4"] .col-1 {
  min-width: 5ch; /* Hält Datum und Zeit stabil untereinander */
}

.osd-text-wrap {
  display: grid !important;
  /* Dynamisches Grid:
     Alle Spalten vor der letzten sind 'min-content' (so schmal wie möglich),
     die allerletzte Spalte ist immer '1fr' (füllt den Rest aus). */
  grid-template-columns: repeat(calc(var(--col-count, 1) - 1), min-content) 1fr;

  align-items: center;
  gap: 0 1ch; /* Sauberer Abstand zwischen den Spalten */
  width: 100%;
  padding: 0;
  font-family: 'Roboto Mono', monospace !important;
}

.osd-column {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Zeigt '...' nur am Ende der Zeile an, wenn der Platz ausgeht */
}

/* 1. Spalte: Datum (z.B. 'So. 05') */
.col-0 {
  grid-column: 1;
  text-align: right;
  min-width: 3ch;
}

/* 2. Spalte: Uhrzeit (z.B. '20:15') */
.col-1 {
  grid-column: 2;
  text-align: left;
}

/* 3. Spalte: Marker (z.B. '*' oder 'V') */
.col-2 {
  grid-column: 3;
  text-align: center; /* Der Marker steht mittig in seinen 3ch */
  min-width: 6ch;
}

/* 4. Spalte: Titel */
.col-3 {
  grid-column: 4;
  padding-left: 0.5ch; /* Direkt nach dem Marker beginnen */
}

/* Spezial-Regel für 2-spaltige Menüs (Kanalliste), damit diese nicht zerschießen */
.osd-text-wrap[style*="--col-count: 2"] {
  grid-template-columns: min-content 1fr;
  gap: 2ch;
}
.osd-text-wrap[style*="--col-count: 2"] .col-0 {
  min-width: 4ch;
  text-align: right;
  padding-right: 0;
}

/* 3. Aktives Element (Fokus) */
.v-list-item--active-solid {
  background-color: #2196F3 !important;
  opacity: 1 !important;
  color: white !important;
}

/* 4. Marquee / Text-Modus */
.overflow-hidden {
  position: relative;
  overflow: hidden;
}

.marquee-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  animation: scrollContinuous linear infinite;
}

@keyframes scrollContinuous {
  0%, 10% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

/* Hilfsklassen */
.description-text {
  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  white-space: pre-line;
}
</style>
