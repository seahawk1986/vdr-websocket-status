export interface SnackbarMessage {
  text: string
  color?: string
  timeout?: number
  onDismiss?: (reason: string) => void
}

export interface OsdHelpKeys {
  red: string
  green: string
  yellow: string
  blue: string
}

export interface OsdItem {
  value: string
  selectable: boolean
}

export interface OsdFullData {
  // type: string
  // sub: string
  title: string
  index: number
  mode: string
  keys: OsdHelpKeys
  items: OsdItem[]
  content: string // OsdTextItem
  scroll: number // OsdTextItem should scroll if != 0 [downwards if < 0, up if > 0], no scrolling if 0
}

export interface OsdUpdate {
  type: string
  sub: string
  index?: number
  keys?: OsdHelpKeys
  scroll?: number
}

export interface OSDData {
  type: string
  sub: string
  title?: string
  index?: number
  mode?: string
  keys?: OsdHelpKeys
  items?: OsdItem[]
  content?: string // OsdTextItem
  scroll?: number // OsdTextItem should scroll if != 0 [downwards if < 0, up if > 0], no scrolling if 0
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
    present?: epgEvent
    following?: epgEvent
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
  subtitle: string
  status: string
  type: string
}

export interface ReplayDisplay {
  name: string
  title: string
  subtitle?: string
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
  primary_volume?: number
  volume: number
  absolute: boolean
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
