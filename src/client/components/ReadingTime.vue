<template>
  <div v-if="options.readingTime.enabled" class="vr-reading-time">
    ⏱ {{ readingTime.displayText.value }}
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { ResolvedReaderOptions } from '../types'

const readingTime = inject<any>('vr-reading-time')!
const options = inject<ResolvedReaderOptions>('vr-options')!
</script>
