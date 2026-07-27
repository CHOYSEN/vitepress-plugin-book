<template>
  <Transition name="vr-fade">
    <button
      v-if="enabled"
      v-show="showButton"
      class="vr-back-to-top"
      :aria-label="'回到顶部'"
      :title="'回到顶部'"
      @click="scrollToTop"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted, onUnmounted } from 'vue'
import { READER_OPTIONS_KEY } from '../constants'
import type { ResolvedReaderOptions } from '../types'

const options = inject<ResolvedReaderOptions>(READER_OPTIONS_KEY)!
const showButton = ref(false)

const enabled = computed(() => options.backToTop.enabled)
const threshold = computed(() => options.backToTop.threshold)

function onScroll(): void {
  showButton.value = window.scrollY > threshold.value
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', onScroll, { passive: true })
    // Check initial state
    onScroll()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onScroll)
  }
})
</script>
