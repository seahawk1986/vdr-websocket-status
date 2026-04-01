import type { OSDData, OSDFocus, OSDItem, OSDKeys, OSDList, OSDTitle } from './interfaces'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOsdStore = defineStore('osd', () => {
  // --- State ---
  const title = ref('')
  const items = ref<string[]>([])
  const focusIndex = ref(-1)
  const helpKeys = ref({ red: '', green: '', yellow: '', blue: '' })
  const visible = ref<bool>(false)

  // --- Actions ---
  function clearOsd() {
    visible.value = false
    title.value = ''
    items.value = []
    focusIndex.value = -1
    helpKeys.value = { red: '', green: '', yellow: '', blue: '' }
  }

  function handleEvent(data: OSDData) {
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
      case 'title': {
        const tData = data as OSDTitle
        title.value = tData.data
        break
      }
      case 'item': {
        const iData = data as OSDItem
        // Reaktives Update an einem spezifischen Index
        items.value[iData.index] = iData.text
        break
      }
      case 'list': {
        const lData = data as OSDList
        items.value = [...lData.items] // Kopie für sicherere Reaktivität
        if (lData.focus !== undefined) {
          focusIndex.value = lData.focus
        }
        helpKeys.value = {
          red: lData.red,
          green: lData.green,
          yellow: lData.yellow,
          blue: lData.blue,
        }
        visible.value = true
        break
      }
      case 'focus': {
        const fData = data as OSDFocus
        focusIndex.value = fData.index
        visible.value = true
        break
      }
      case 'help': {
        const kData = data as OSDKeys
        helpKeys.value = {
          red: kData.red,
          green: kData.green,
          yellow: kData.yellow,
          blue: kData.blue,
        }
        break
      }
    }
  }

  // Alles nach außen hin freigeben
  return {
    title,
    items,
    focusIndex,
    helpKeys,
    visible,
    handleEvent,
    clearOsd,
  }
})
