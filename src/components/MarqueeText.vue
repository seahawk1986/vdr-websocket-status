<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, watch } from 'vue'

  const props = defineProps<{ content?: any }>()
  const container = ref<HTMLElement | null>(null)
  const textEl = ref<HTMLElement | null>(null)
  const isOverflowing = ref(false)
  const textWidth = ref(0)
  const resetKey = ref(0)

  const pixelsPerSecond = 40 // Etwas langsamer für bessere Lesbarkeit
  const startDelay = 3 // 3 Sekunden warten vor dem Start

  const scrollDuration = computed(() => {
    if (!textWidth.value) return 10
    // Weg ist genau 50% der Gesamtbreite (ein voller Textdurchlauf)
    return (textWidth.value / 2) / pixelsPerSecond
  })

  async function check () {
    await nextTick()
    resetKey.value++ // Reset bei Inhaltswechsel

    setTimeout(() => {
      if (container.value && textEl.value) {
        const cW = container.value.clientWidth
        const tW = textEl.value.scrollWidth
        textWidth.value = tW
        isOverflowing.value = tW > cW + 2
      }
    }, 100)
  }

  onMounted(check)
  watch(() => props.content, check)
</script>

<template>
  <div ref="container" v-resize="check" class="marquee-container">
    <div
      :key="resetKey"
      :class="['marquee-content', { 'is-scrolling': isOverflowing }]"
      :style="{
        animationDuration: `${scrollDuration}s`,
        animationDelay: `${startDelay}s`
      }"
    >
      <span ref="textEl" class="pr-16 d-inline-block"><slot /></span>
      <!-- Der Klon wird hier zum "Zielhafen" -->
      <span v-if="isOverflowing" class="pr-16 d-inline-block"><slot /></span>
    </div>
  </div>
</template>

<style scoped>
.marquee-container {
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
}

.marquee-content {
  display: inline-flex;
  width: max-content;
  will-change: transform;
  transform: translateX(0);
}

.is-scrolling {
  animation-name: marquee-once;
  animation-timing-function: linear;
  animation-iteration-count: 1; /* Nur einmal scrollen */
  animation-fill-mode: forwards; /* Am Ende stehen bleiben */
}

@keyframes marquee-once {
  0% { transform: translateX(0); }
  /* Wir scrollen exakt so weit, bis der Klon den Platz des Originals einnimmt */
  100% { transform: translateX(-50%); }
}
</style>
