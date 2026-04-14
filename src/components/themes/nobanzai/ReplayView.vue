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
  const isReady = ref(false)

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

    // Hard reset of transition state to prevent initial jump
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isReady.value = true
      })
    })
  })

  /**
   * Formats seconds into HH:mm
   */
  function formattedDuration (duration: number) {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const m = minutes.toString().padStart(2, '0')
    return `${hours}:${m}`
  }

  /**
   * Determines icon based on playback state and speed
   */
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

  /**
   * Animated position for the "noodle" time indicator
   */
  const noodleStyle = computed(() => ({
    left: `${store.replayProgress}%`,
    top: '40px',
    zIndex: 1,
    transform: store.replayProgress > 10
      ? 'translateX(-100%)'
      : 'translateX(-50%)',
    whiteSpace: 'nowrap',
  }))

  /**
   * Adjusts arrow shift based on alignment
   */
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
            class="mt-4 mb-22"
            :class="{ 'no-transition': !isReady }"
            style="position: relative; width: 100%;"
          >
            <v-progress-linear
              v-model="store.replayProgress"
              class="mt-2"
              color="primary"
              height="25"
              rounded
            />

            <transition name="fade">
              <div
                v-if="isElapsedVisible"
                class="font-weight-black epg-font-main position-absolute"
                style="left: 0; top: 40px; white-space: nowrap;"
                :style="{ fontSize: '9vh', lineHeight: '1' }"
              >
                <div style="padding-top: 6vh;">
                  {{ elapsedTime || '00:00' }}
                </div>
              </div>
            </transition>

            <div
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
                -{{ remainingTime || '00:00' }}
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
.time-noodle {
  pointer-events: none;
  /* Apply transitions globally to the noodle */
  transition: left 0.3s ease-out, transform 0.3s ease-out;
}

/* Disable transitions while loading */
.no-transition .time-noodle,
.no-transition .v-icon {
  transition: none !important;
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

.description-text :deep(*) {
  font-size: clamp(1.2rem, 3vw + 0.5rem, 2.5rem) !important;
  opacity: 0.9;
  white-space: pre-line;
}
</style>
