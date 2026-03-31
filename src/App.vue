<template>
  <v-app>
    <v-main>
      <ConnectView />
      <v-snackbar-queue
        v-model="messages"
        location="top"
        max-width="95vw"
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

        <!-- Das Icon links von der Uhrzeit -->

        <date-time />
        <!-- <div class="recording-indicator">
          <v-icon
            class="recording-pulse"
            color="red"
            icon="mdi-record"
          />
        </div> -->
      </v-sheet>
    </v-footer>
    <!-- <v-btn
      class="ma-2"
      icon="mdi-theme-light-dark"
      location="bottom right"
      position="absolute"
      @click="$vuetify.theme.cycle()"
    /> -->
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted, ref, type Ref } from 'vue'
  import { type InitialData, type OSDMessage, type Position, type ReplayDisplay, Screen, type TVDisplay, useAppStore } from '@/stores/app'
  import WebSocketClient from '@/websocket'
  import ConnectView from './components/ConnectView.vue'
  import DateTime from './components/DateTime.vue'
  import ReplayView from './components/ReplayView.vue'
  import TvView from './components/TvView.vue'
  const store = useAppStore()

  const isActive: Ref<boolean | null> = ref(null)
  const ErrorMessage: Ref<string | null> = ref(null)

  const snackbarQueue = ref()
  const messages = ref<string[]>([])
  const logs = ref([])
  let messageCount = 0

  function addMessage (message: string, color: string) {
    const id = ++messageCount
    messages.value.push({
      text: message,
      color: color,
      onDismiss (reason) {
        logs.value.unshift(`Message #${id}: Closed (${reason})`)
      },
    })
  }

  function processTvData (data: TVDisplay) {
    store.currentChannelNumber = data.number
    store.currentChannelName = data.name
    if (data.epg) {
      store.currentEvent = data.epg.present ?? null
      store.nextEvent = data.epg.following ?? null
    } else {
      store.currentEvent = null
      store.nextEvent = null
    }
    if (data.logo) {
      store.channelLogo = data.logo
    }
    if (data.tech) {
      store.channelIsEncrypted = data.tech.is_encrypted
      store.channelHasTeletext = data.tech.has_teletext
      store.channelHasDolby = data.tech.has_dolby
      store.channelAudioTracksCount = data.tech.audio_tracks_count
    }
  }
  function processReplayData (data: ReplayDisplay) {
    store.ScreenMode = data.status === 'started' ? Screen.Replay : Screen.TV
    store.replayName = data.name
    store.replaying = true
    store.replaying = data.status === 'started'
    store.replayRecording = data.recording ?? null
  }

  onMounted(() => {
    try {
      const _wsConnection = new WebSocketClient({
        url: `ws://${store.baseUrl}`, // "ws://" + location.host, // TODO: use location based url
        protocol: 'osd2vdr',
        autoReconnectInterval: 1000,
        onopen: () => {
          console.log('Connected to `ws://${store.baseUrl}`')
        },
        onclose: () => {
          isActive.value = null // auf null setzten, dass ein neues login aufgerufen wird
        },
        onmessage: msg => {
          try {
            const data = JSON.parse(msg.data.replace())
            console.log('got data:', data)
            switch (data.type) {
              case 'initial_full_state': {
                {
                  const initialdata = data as InitialData
                  isActive.value = true
                  store.hasLogos = false // TODO: use plugin settings
                  store.volume = initialdata.volume
                  store.replaying = initialdata.replaying
                  store.ScreenMode = initialdata.replaying ? Screen.Replay : Screen.TV
                  if (initialdata.current_display.type === 'channel') {
                    processTvData(initialdata.current_display as TVDisplay)
                  } else if (initialdata.current_display.type === 'replay') {
                    processReplayData(initialdata.current_display as ReplayDisplay)
                  }
                }
                break
              }
              case 'channel': {
                processTvData(data as TVDisplay)
                break
              }
              case 'replay': {
                processReplayData(data as ReplayDisplay)
                break
              }
              case 'pos': {
                const posData = data as Position
                store.replayPosition = posData.current
                store.replayPositionTotal = posData.total
                store.replaying = posData.play
                store.replayDirectionForward = posData.forward
                store.replaySpeed = posData.speed
                break
              }
              case 'osdmessage': {
                const osdmessage = data as OSDMessage
                addMessage(osdmessage.message, 'yellow')
              }
              // this.$emit(data.value.event, data.value.object)
            }
          } catch (error) {
            console.log(error)
          }
        },
      })
    } catch {
      store.ScreenMode = Screen.NotConnected
      ErrorMessage.value = 'Your browser does not suport Websockets!'
    }
  })
</script>

