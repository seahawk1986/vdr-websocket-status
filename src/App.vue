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
  import { onMounted, onUnmounted, ref, type Ref, watch } from 'vue'
  import ConnectView from '@/components/ConnectView.vue'
  import LargeTvView from '@/components/LargeTvView.vue'
  import OSDMenu from '@/components/OSDMenu.vue'
  import ReplayView from '@/components/ReplayView.vue'
  import TvView from '@/components/TvView.vue'
  import { useAppStore } from '@/stores/app'
  import { Screen } from '@/stores/interfaces'
  const store = useAppStore()
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
