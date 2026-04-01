<template>
  <v-dialog v-model="store.IsInitializing" fullscreen>
    <v-container class="fill-height ma-0 pa-0 ga-0" fluid no-gutters>
      <v-row align="center" justify="start" no-gutters>
        <v-col cols="12" md="4" no-gutters sm="8">
          <v-sheet
            class="d-flex justify-center align-center ma-0 pa-0 ga-0"
            height="100vh"
            width="100vw"
          >
            <v-container>
              <v-row align="center">
                <v-col
                  class="d-flex justify-center"
                  cols="12"
                >
                  <CurrentTime
                    class="text-fluid-display"
                    format="FullDateTime24h"
                  />
                </v-col>
                <v-col
                  class="d-flex justify-center text-xs-center text-display-large"
                  cols="12"
                >
                  Waiting for VDR websocket connection …
                </v-col>
                <v-col
                  class="d-flex justify-center"
                  cols="12"
                >
                  <v-progress-circular
                    color="primary"
                    :indeterminate="true"
                    size="64"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/stores/app'
  import CurrentTime from './CurrentTime.vue'

  const store = useAppStore()

</script>

<style scoped>
.text-fluid-display :deep(*) {
  font-size: clamp(1.2rem, 5vw + 0.5rem, 6rem) !important;
  line-height: 1.3 !important;
}
/* fill v-main completly */
.h-100 {
  height: 100% !important;
  min-height: 100%;
}

/* Container that wraps ans centers everything */
.content-wrapper {
  width: 100%;
  max-width: 1800px; /*Optional: limit on Ultra-Wide screens*/
  margin: 0 auto;
  padding: 0 0vw; /* no padding */
}

/* adapt divider height to large fonts */
:deep(.v-divider--vertical) {
  height: 1.5em !important;
  align-self: center;
}

.time-width {
  min-width: 6ch;
  text-align: center;
}
</style>
