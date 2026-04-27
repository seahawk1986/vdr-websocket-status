<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import DateTime from '@/components/DateTime.vue'
  import MarqueeText from '@/components/MarqueeText.vue'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()

  const containerRef = ref<any>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const isOverflowing = ref(false)
  const contentHeight = ref(0)

  /**
   * isInitialized: Controls the presence of the noodle in the DOM
   * canAnimate: Switches on CSS transitions after the initial paint
   */
  const isInitialized = ref(false)
  const canAnimate = ref(false)

  /**
   * Ensures we only start rendering when actual data is available
   */
  const hasValidData = computed(() => {
    return store.replayPositionTotal > 0 && store.replayProgress > 0
  })

  /**
   * Checks if content height exceeds container capacity
   */
  async function checkOverflow () {
    await nextTick()
    const container = containerRef.value?.$el || containerRef.value
    const content = contentRef.value

    if (container && content) {
      const containerH = container.clientHeight
      const contentH = content.scrollHeight

      if (contentH > containerH + 2) {
        contentHeight.value = contentH + 16
        isOverflowing.value = true
      } else {
        isOverflowing.value = false
      }
    }
  }

  onMounted(() => {
    window.addEventListener('resize', checkOverflow)
    const initNoodle = (valid: boolean) => {
      if (valid && !isInitialized.value) {
        isInitialized.value = true
        requestAnimationFrame(() => {
          canAnimate.value = true
        })
        if (unwatch) unwatch()
      }
    }
    const unwatch = watch(hasValidData, valid => {
      initNoodle(valid)
    })
    initNoodle(hasValidData.value)
  })

  function formattedDuration (duration: number) {
    if (!duration || duration < 0) return '0:00'
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const m = minutes.toString().padStart(2, '0')
    return `${hours}:${m}`
  }

  const replayIcon = computed(() => {
    if (store.replaying) {
      switch (store.replaySpeed) {
        case -1: { return 'mdi-play'
        }
        case 1: { return store.replayDirectionForward ? 'mdi-chevron-right' : 'mdi-chevron-left'
        }
        case 2: { return store.replayDirectionForward ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'
        }
        case 3: { return store.replayDirectionForward ? 'mdi-chevron-triple-right' : 'mdi-chevron-triple-left'
        }
        default: { return 'mdi-help'
        }
      }
    } else {
      return 'mdi-pause'
    }
  })

  const elapsedTime = computed(() => formattedDuration(store.replayPosition))
  const remainingTime = computed(() => {
    const remainingSeconds = store.replayPositionTotal - store.replayPosition
    return formattedDuration(remainingSeconds)
  })

  const isElapsedVisible = computed(() => store.replayProgress > 30)

  const noodleStyle = computed(() => ({
    left: `${store.replayProgress}%`,
    top: '40px',
    zIndex: 1,
    transform: store.replayProgress > 10
      ? 'translateX(-100%)'
      : 'translateX(-50%)',
    whiteSpace: 'nowrap',
  }))

  const arrowStyle = computed(() => ({
    transform: store.replayProgress > 10 ? 'translateX(50%)' : 'translateX(0)',
  }))
</script>

<template>
  <v-card
    class="bg-black fill-height"
    flat
    style="position: fixed; inset: 0; overflow: hidden; font-family: sans-serif;"
    tile
  >
    <v-container class="pa-10" fluid>
      <v-row no-gutters>
        <v-col class="d-flex flex-column" cols="12">
          <div
            class="font-weight-black mb-2 main-title"
            :style="{ fontSize: '12vh', lineHeight: '1.3' }"
          >
            <MarqueeText :content="store.replayName">
              {{ store.replayName?.split('~').at(-1) || 'no recording' }}
            </MarqueeText>
          </div>

          <div
            v-if="store.replayShortText?.length > 0"
            class="font-weight-bold text-grey-lighten-1 mb-8 sub-title"
            :style="{ fontSize: '10vh', lineHeight: '1.2' }"
          >
            <MarqueeText :content="store.replayShortText">
              {{ store.replayShortText }}
            </MarqueeText>
          </div>

          <div
            v-if="hasValidData"
            class="mt-4 mb-22"
            :class="{ 'is-ready': canAnimate }"
            style="position: relative; width: 100%;"
          >
            <v-progress-linear
              v-model="store.replayProgress"
              class="mt-2"
              color="primary"
              height="25"
              rounded
              style="transition: none;"
            />

            <transition name="fade">
              <div
                v-if="isElapsedVisible && isInitialized"
                class="font-weight-black epg-font-main position-absolute"
                style="left: 0; top: 40px; white-space: nowrap;"
                :style="{ fontSize: '9vh', lineHeight: '1' }"
              >
                <div style="padding-top: 6vh;">
                  {{ elapsedTime }}
                </div>
              </div>
            </transition>

            <div
              v-if="isInitialized"
              class="position-absolute d-flex flex-column time-noodle"
              :class="store.replayProgress > 10 ? 'align-end' : 'align-center'"
              :style="noodleStyle"
            >
              <v-icon
                class="mt-0"
                color="primary"
                icon="mdi-menu-up"
                size="8vh"
                :style="arrowStyle"
              />

              <span
                class="font-weight-black epg-font-main"
                :class="store.replayProgress > 10 ? 'text-right' : 'text-center'"
                :style="{ fontSize: '9vh', marginTop: '-2vh', lineHeight: '1' }"
              >
                -{{ remainingTime }}
              </span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <Teleport defer to="#footer-actions">
      <v-row
        class="px-6 pb-2 align-center bg-background"
        no-gutters
        style="height: 16vh; position: absolute; bottom: 0; width: 100%; z-index: 2;"
      >
        <v-col cols="6">
          <div :style="{ fontSize: 'clamp(3rem, 5vw, 7rem)' }">
            <v-icon :icon="replayIcon" />
          </div>
        </v-col>

        <v-col class="d-flex justify-end pr-0" cols="6">
          <div class="clock-font font-weight-black text-uppercase text-right">
            <date-time format="fullTime24h" />
          </div>
        </v-col>
      </v-row>
    </Teleport>

    <div id="footer-actions" />
  </v-card>
</template>

<style scoped>
/* Disable animations by default to avoid the initial jump from 0 */
.time-noodle,
.v-icon {
  transition: none;
}

/* Enable smooth transitions only after the component is ready and placed */
.is-ready .time-noodle {
  transition:
    left 0.3s ease-out,
    transform 0.3s ease-out,
    opacity 0.2s ease-in !important;
}

.is-ready .v-icon {
  transition: transform 0.3s ease-out !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.main-title :deep(*),
.sub-title :deep(*) {
  font-size: inherit !important;
  line-height: inherit !important;
}
</style>
