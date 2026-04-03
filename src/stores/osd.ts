import type { OSDData, OsdFullData, OsdUpdate } from './interfaces'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOsdStore = defineStore('osd', () => {
  // --- State ---
  // const title = ref('')
  // const items = ref<string[]>([])
  // const focusIndex = ref(-1)
  // const helpKeys = ref({ red: '', green: '', yellow: '', blue: '' })
  const visible = ref<boolean>(false)
  const osd = ref<OsdFullData>({
    title: '',
    items: [],
    index: -1,
    mode: 'list',
    keys: {
      red: '',
      green: '',
      yellow: '',
      blue: '',
    },
    content: '',
    scroll: 0,
  })

  // --- Actions ---
  function clearOsd () {
    visible.value = false
    // title.value = ''
    // items.value = []
    // focusIndex.value = -1
    // helpKeys.value = { red: '', green: '', yellow: '', blue: '' }
  }

  function handleEvent (data: OSDData) {
    if (data.type !== 'osd') {
      return
    }

    // OSD einblenden, außer bei 'clear'
    if (data.sub !== 'clear') {
      visible.value = true
    }

    switch (data.sub) {
      case 'clear': {
        clearOsd()
        break
      }
      case 'full': {
        const tData = data as OsdFullData
        osd.value = tData
        break
      }
      case 'update': {
        const iData = data as OsdUpdate
        // Reaktives Update an einem spezifischen Index
        if (osd.value) {
          if (iData.keys !== undefined) {
            osd.value.keys = iData.keys
          }
          if (iData.index !== undefined) {
            console.log('update OSD index to:', iData.index)
            osd.value.index = iData.index
          }
          if (iData.scroll !== undefined) {
            osd.value.scroll = iData.scroll
          }
        }
        break
      }
    }
  }

  // Alles nach außen hin freigeben
  return {
    osd,
    visible,
    handleEvent,
    clearOsd,
  }
})
