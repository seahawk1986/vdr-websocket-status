<template>
  <v-app>
    <v-main class="d-flex flex-column" style="height: 100vh;">
      <ConnectView />
      <v-snackbar-queue
        ref="snackbarQueue"
        v-model="store.snackBarMessages"
        display-strategy="overflow"
        location="top"
        max-width="95vw"
        style="z-index: 5000"
        :timeout="-1"
        :total-visible="1"
      >
        <template #text="{ item }">
          <div
            :style="{ fontSize: 'clamp(3rem, 5vw, 7rem)' }"
          >
            {{ item.text }}
          </div>
        </template>
      </v-snackbar-queue>
      <OSDMenu />
      <template v-if="store.ScreenMode == Screen.TV">
        <LargeTvView v-if="store.showLargeTVView" />
        <ClockTvView v-else-if="store.showClockTVView" />
        <NoBanzai v-else-if="store.noBanzaiView" />
        <TvView v-else />
      </template>
      <ReplayView v-else-if="store.ScreenMode == Screen.Replay" class="flex-grow-1" />
    </v-main>
    <v-footer app class="pa-0 bg-transparent">
      <div id="footer-actions" class="w-100" />
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
  import type { VSnackbarQueue } from 'vuetify/components'
  import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
  import ClockTvView from '@/components/ClockTvView.vue'
  import ConnectView from '@/components/ConnectView.vue'
  import LargeTvView from '@/components/LargeTvView.vue'
  import NoBanzai from '@/components/NoBanzai.vue'
  import OSDMenu from '@/components/OSDMenu.vue'
  import ReplayView from '@/components/ReplayView.vue'
  // import TvView from '@/components/TvView.vue'
  import DefaultTvView from '@/components/TvView.vue'
  import { useAppStore } from '@/stores/app'
  import { Screen } from '@/stores/interfaces'

  const store = useAppStore()

  const modules = import.meta.glob('./components/themes/*/TvView.vue', { eager: true })
  console.log('modules:', modules)
  const TvView = shallowRef<any>(DefaultTvView)
  if (store.userSuppliedTheme) {
    const targetPath = `./components/themes/${store.userSuppliedTheme}/TvView.vue`
    if (modules[targetPath]) {
      const mod = modules[targetPath] as any
      TvView.value = mod.default || mod
      console.log(`[DynamicView] Successfully switched to: ${store.userSuppliedTheme}`)
    } else {
      console.error(`[DynamicView] File not found in modules: ${targetPath}`)
    }
  }

  const snackbarQueue = ref<InstanceType<typeof VSnackbarQueue> | null>(null)

  function clearSnackbar () {
    snackbarQueue.value?.clear()
  }

  watch(() => store.lastOsdClear, () => {
    clearSnackbar()
  })

  onMounted(() => {
    try {
      store.webSocketConnect()
    } catch (error) {
      console.log('cloud not open ws connection', error)
    }
  })
  onUnmounted(() => {})
</script>
