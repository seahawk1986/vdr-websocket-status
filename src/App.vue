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
        <TvView />
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
  import { defineAsyncComponent, markRaw, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { Screen } from '@/stores/interfaces'

  const store = useAppStore()
  const theme = store.userSuppliedTheme

  function resolveComponent (name: string) {
    return defineAsyncComponent(async () => {
      try {
        if (theme) {
          return await import(`./components/themes/${theme}/${name}.vue`)
        }
        throw new Error('No theme')
      } catch {
        return await import(`./components/${name}.vue`)
      }
    })
  }
  const ConnectView = markRaw(resolveComponent('ConnectView'))
  const OSDMenu = markRaw(resolveComponent('OSDMenu'))
  const ReplayView = markRaw(resolveComponent('ReplayView'))
  const TvView = markRaw(resolveComponent('TvView'))

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
