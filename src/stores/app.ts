// Utilities
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

import WebSocketClient from '@/websocket'
import { fa } from 'vuetify/locale'

export interface SnackbarMessage {
  text: string
  color?: string
  timeout?: number
  onDismiss?: (reason: string) => void
}

export interface LiveTV {

}

export interface Position {
  current: number
  total: number
  play: boolean
  speed: number
  forward: boolean
  type: string
}

export interface Event {
  duration: number
  progress: number
  short_text?: string
  start: number
  title: string
}

export interface ChannelTech {
  has_dolby: boolean
  audio_tracks_count: number
  is_encrypted: boolean
  has_teletext: boolean
}

export interface TVDisplay {
  epg?: {
    present?: Event
    following?: Event
  }
  tech?: ChannelTech
  name: string
  number: number
  logo: string
  type: string
}

export interface Recording {
  description: string
  duration: number
  title: string
  status: string
  type: string
}

export interface ReplayDisplay {
  name: string
  recording?: Recording
  status: string
  play: boolean
  speed: number
  type: string
}

export interface InitialData {
  active_recordings: number
  current_display: TVDisplay | ReplayDisplay
  is_recording: boolean
  n_timer: number
  replaying: boolean
  volume: number
  type: string
}

export interface TimerData {
  type: string
  timer_name: string
  timer_id: number
  timer_change: boolean
  timer_channel_id: string
  timer_channel_name: string
}

export interface TimerStatusData {
  type: string
  is_recording: boolean
  active_recordings: number
  n_timer: number
}

export interface VolumeData {
  type: string
  volume: number
}

export enum Screen {
  NotConnected = -1,
  TV = 0,
  Replay = 1,
}

export interface OSDMessage {
  message: string
  priority: number
}

export const useAppStore = defineStore('app', () => {
  const defaultPort = 6742
  const hasLogos = ref(false)
  const params = new URLSearchParams(document.location.search)
  const userSuppliedPort = params.get('port')
  const showEndTime = params.has('show_end_time')
  const showLargeTVView = params.has('large_tv_view')

  const port = computed(() => {
    return userSuppliedPort && userSuppliedPort.length > 0 ? userSuppliedPort : defaultPort
  })
  const baseUrl = computed(() => {
    const host = window.location.hostname
    return `${host}:${port.value}`
  })
  const ScreenMode = ref(Screen.NotConnected)
  const currentChannelNumber: Ref<number | null> = ref(null)
  const currentChannelName: Ref<string | null> = ref(null)
  const IsInitializing = computed(() => {
    return ScreenMode.value === Screen.NotConnected
  })
  const replayName = ref('')
  const replayRecording: Ref<Recording | null> = ref(null)
  const replayPosition = ref(0)
  const replayProgress = computed(() => {
    return 100 * (replayPosition.value / replayPositionTotal.value)
  })
  const replayPositionTotal = ref(0)
  const volume = ref<number>(0)
  const replaying = ref(false)
  const replayDirectionForward = ref(true)
  const replaySpeed = ref(0)
  const is_recording = ref(false)

  const channelIsEncrypted = ref(false)
  const channelHasTeletext = ref(false)
  const channelHasDolby = ref(false)
  const channelAudioTracksCount = ref(0)
  const channelLogo = ref('')

  const currentEvent: Ref<null | Event> = ref(null)
  const nextEvent: Ref<null | Event> = ref(null)


  const snackBarMessages = ref<SnackbarMessage[]>([])
  const clearOSDListeners = new Set<(data: any) => void>()

  const clearOSD = () => {
    snackBarMessages.value = []
    for (const callback of clearOSDListeners) {
      callback('clearosd')
    }
  }

  function onClearOSD(callback: (data: any) => void) {
    clearOSDListeners.add(callback)
  }

  function addMessage(text: string, color: string) {
    snackBarMessages.value.push({
      text,
      color,
    })
  }

  function processTvData(data: TVDisplay) {
    currentChannelNumber.value = data.number
    currentChannelName.value = data.name
    if (data.epg) {
      currentEvent.value = data.epg.present ?? null
      nextEvent.value = data.epg.following ?? null
    } else {
      currentEvent.value = null
      nextEvent.value = null
    }
    if (data.logo) {
      channelLogo.value = data.logo
    }
    if (data.tech) {
      channelIsEncrypted.value = data.tech.is_encrypted
      channelHasTeletext.value = data.tech.has_teletext
      channelHasDolby.value = data.tech.has_dolby
      channelAudioTracksCount.value = data.tech.audio_tracks_count
    }
  }
  function processReplayData(data: ReplayDisplay) {
    ScreenMode.value = data.status === 'started' ? Screen.Replay : Screen.TV
    replayName.value = data.name
    replaying.value = true
    replaying.value = data.status === 'started'
    replayRecording.value = data.recording ?? null
  }

  const isActive = ref(false) // this is set to true after we receive the first message and to false on a close
  const isConnected = ref(false)
  const lastMessage = ref<any>(null)
  let wsClient: WebSocketClient | null = null

  function webSocketConnect() {
    if (wsClient) {
      return
    } // prevent multiple connections
    wsClient = new WebSocketClient({
      url: `ws://${baseUrl.value}`,
      autoReconnectInterval: 1000,
      onopen: () => {
        isConnected.value = true
        console.log('Store: ws connected')
      },
      onclose: () => {
        isConnected.value = false
        ScreenMode.value = Screen.NotConnected
        console.log('Store: ws lost connection')
      },
      onmessage: event => {
        try {
          const data = JSON.parse(event.data.replace())
          lastMessage.value = data
          console.log('got data:', data)
          switch (data.type) {
            case 'initial_full_state': {
              {
                clearOSD()
                const initialdata = data as InitialData
                isActive.value = true
                hasLogos.value = false // TODO: use plugin settings
                volume.value = initialdata.volume
                replaying.value = initialdata.replaying
                is_recording.value = initialdata.is_recording
                ScreenMode.value = initialdata.replaying ? Screen.Replay : Screen.TV
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
              replayPosition.value = posData.current
              replayPositionTotal.value = posData.total
              replaying.value = posData.play
              replayDirectionForward.value = posData.forward
              replaySpeed.value = posData.speed
              break
            }
            case 'timer': {
              const timerData = data as TimerData
              console.log('got timer data', timerData)
              break
            }
            case 'timer_status_update': {
              const timerStatusUpdate = data as TimerStatusData
              is_recording.value = timerStatusUpdate.is_recording
              // TODO: timerStatusUpdate.active_recordings
              // TODO: timerStatusUpdate.n_timer
              break
            }
            case 'osdmessage': {
              const osdmessage = data as OSDMessage
              const priorities = ['yellow', 'green', 'orange', 'red']
              if (osdmessage.message.length > 0) {
                addMessage(osdmessage.message, priorities[osdmessage.priority])
              } else {
                clearOSD()
              }
              break
            }
            case 'volume': {
              const volumedata = data as VolumeData
              volume.value = volumedata.volume
              break
            }
          }
        } catch (error) {
          console.log(error)
        }
      },
      onerror: err => {
        console.error('Store: ws connection error', err)
      },
    })
  }

  function sendMessage(payload: object) {
    wsClient?.send(payload)
  }

  return {
    isConnected,
    lastMessage,
    webSocketConnect,
    sendMessage,
    snackBarMessages,
    onClearOSD,

    hasLogos,
    IsInitializing,
    baseUrl, ScreenMode,
    channelIsEncrypted,
    channelAudioTracksCount,
    channelHasDolby,
    channelHasTeletext,
    channelLogo,
    currentChannelName,
    currentChannelNumber,
    showEndTime,
    showLargeTVView,
    replayName,
    replayRecording,
    replayPosition,
    replayPositionTotal,
    replayProgress, volume,
    replaying,
    replayDirectionForward,
    replaySpeed,
    is_recording,
    currentEvent,
    nextEvent,
  }
})
