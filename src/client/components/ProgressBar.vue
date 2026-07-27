<template>
  <div
    v-if="options.readingProgress.enabled"
    class="vb-progress-bar"
    :style="{ width: `${readingProgress.progress.value}%` }"
    role="progressbar"
    :aria-valuenow="readingProgress.progress.value"
    aria-valuemin="0"
    aria-valuemax="100"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { ResolvedReaderOptions } from '../types'

const readingProgress = inject<any>('vb-reading-progress')!
const options = inject<ResolvedReaderOptions>('vb-options')!
</script>
