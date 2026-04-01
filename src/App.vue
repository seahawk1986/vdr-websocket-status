<template>
  <v-app>
    <v-main>
      <ConnectView />
      <v-snackbar-queue
        ref="snackbarQueue"
        v-model="store.snackBarMessages"
        display-strategy="overflow"
        location="top"
        max-width="95vw"
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
      <TvView v-if="store.ScreenMode == Screen.TV" />
      <ReplayView v-else-if="store.ScreenMode == Screen.Replay" />
    </v-main>
    <v-footer app class="pa-0 w-100 bg-transparent">
      <v-sheet class="d-flex justify-center align-center bg-transparent pa-4 flex-grow-1">
        <date-time />
      </v-sheet>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
  import type { VSnackbarQueue } from 'vuetify/components'
  import { onMounted, ref, type Ref } from 'vue'
  import { Screen, useAppStore} from '@/stores/app'
  import ConnectView from './components/ConnectView.vue'
  import DateTime from './components/DateTime.vue'
  import ReplayView from './components/ReplayView.vue'
  import TvView from './components/TvView.vue'
  const store = useAppStore()
  const snackbarQueue = ref<InstanceType<typeof VSnackbarQueue> | null>(null)


  function clearSnackbar() {
    snackbarQueue.value?.clear()
  }
  store.onClearOSD(() => {
    clearSnackbar()
  })
  onMounted(() => {
    store.webSocketConnect()
  })
</script>
