// Utilities
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

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
  const volume = ref(0)
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

  return {
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
