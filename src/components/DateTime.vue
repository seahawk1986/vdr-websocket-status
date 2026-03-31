<template>
  <v-sheet class="text-display-large bg-transparent">
    {{ currentTimeString }}
  </v-sheet>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { useDate } from 'vuetify'

  const date = useDate()

  const currentTime = ref(new Date())
  function updateCurrentTime () {
    currentTime.value = new Date()
  }
  const updateTimeInterval = setInterval(updateCurrentTime, 1000)
  onBeforeUnmount(() => {
    clearInterval(updateTimeInterval)
  })

  const currentTimeString = computed(() => {
    return date.format(currentTime.value, 'fullDateTime24h')
  })
</script>
