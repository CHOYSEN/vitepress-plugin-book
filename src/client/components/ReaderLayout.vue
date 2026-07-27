<template>
  <!--
    ReaderLayout is the orchestrator. It:
    1. Calls all composables once to ensure shared state
    2. Provides reactive state to child components via inject
    3. Delegates UI rendering to VitePress's Layout slot system
  -->
  <slot />
</template>

<script setup lang="ts">
import { provide, inject } from 'vue'
import { READER_OPTIONS_KEY } from '../constants'
import { useReadingProgress } from '../composables/useReadingProgress'
import { useScrollMemory } from '../composables/useScrollMemory'
import { useReadingTime } from '../composables/useReadingTime'
import { useReadingStats } from '../composables/useReadingStats'
import { useSidebarData } from '../composables/useSidebarData'
import type { ResolvedReaderOptions } from '../types'

const options = inject<ResolvedReaderOptions>(READER_OPTIONS_KEY)!

// Initialize all side-effect composables (scroll memory, stats timer)
useScrollMemory(options)
useReadingStats(options)

// Compute shared state once
const readingTime = useReadingTime(options)
const readingProgress = useReadingProgress(options)
const sidebarData = useSidebarData()

// Provide shared state to UI components
provide('vr-reading-time', readingTime)
provide('vr-reading-progress', readingProgress)
provide('vr-sidebar-data', sidebarData)
provide('vr-options', options)
</script>
