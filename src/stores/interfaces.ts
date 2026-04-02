export interface SnackbarMessage {
  text: string
  color?: string
  timeout?: number
  onDismiss?: (reason: string) => void
}

export interface OSDData {
  type: string
  sub: string
  data?: string
  text?: string
  index?: number
  red?: string
  green?: string
  yellow?: string
  blue?: string
}

export interface OSDTitle {
  type: string
  sub: string
  data: string
}

export interface OSDItem {
  type: string
  sub: string
  index: number
  text: string
}

export interface OSDList {
  type: string
  sub: string
  focus: number
  items: string[]
  title: string
  red: string
  green: string
  yellow: string
  blue: string
}

export interface OSDFocus {
  type: string
  sub: string
  index: number
}

export interface OSDKeys {
  type: string
  sub: string
  red: string
  green: string
  yellow: string
  blue: string

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

export interface epgEvent {
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
  shorttext: string
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