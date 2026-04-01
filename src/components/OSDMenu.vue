<template>
  <v-dialog
    v-model="osd.visible"
    fullscreen
    scrim="black"
    transition="fade-transition"
  >
    <v-card class="d-flex flex-column rounded-0" color="grey-darken-4">
      <!-- Toolbar -->
      <v-toolbar color="blue-darken-3" density="compact" flat>
        <v-toolbar-title class="text-mono">{{ osd.title || 'VDR Menü' }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="osd.visible = false" />
      </v-toolbar>

      <!-- Scroll-Container (Native div für zuverlässigen querySelector) -->
      <v-card-text ref="scrollContainer" class="pa-0 flex-grow-1 overflow-y-auto">
        <v-list bg-color="transparent" class="osd-list" density="compact">
          <v-list-item
            v-for="(item, index) in osd.items"
            :key="index"
            :active="osd.focusIndex === index"
            class="text-mono"
            color="yellow-darken-2"
            :data-index="index"
          >
            <template #prepend>
              <span class="text-grey mr-4 font-weight-light" style="width: 25px">
                {{ index + 1 }}
              </span>
            </template>
            <v-list-item-title class="text-white">{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <!-- Farbtasten-Footer -->
      <v-footer class="pa-2 bg-grey-darken-3" height="auto">
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
  import { nextTick, ref, watch } from 'vue'
  import { useOsdStore } from '@/stores/osd'

  const osd = useOsdStore()
  const scrollContainer = ref(null)

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
</style>
