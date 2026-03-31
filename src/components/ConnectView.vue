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
                    class="text-display-large"
                  />
                </v-col>
                <v-col
                  class="d-flex justify-center text-xs-center text-display-large"
                  cols="12"
                >
                  Waiting for websocket …
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
