<template>
  <Teleport to="body">
    <Transition name="vr-toast">
      <div v-if="visible" class="vr-continue-reading" role="alert">
        <div class="vr-continue-reading__content">
          <span class="vr-continue-reading__icon">📖</span>
          <span class="vr-continue-reading__text">
            继续阅读上次的章节？
          </span>
        </div>
        <div class="vr-continue-reading__actions">
          <button class="vr-btn vr-btn--primary" @click="onGo">
            继续
          </button>
          <button class="vr-btn vr-btn--ghost" @click="onDismiss" aria-label="关闭">
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue'
import type { ResolvedReaderOptions } from '../types'

const readingProgress = inject<any>('vr-reading-progress')!
const options = inject<ResolvedReaderOptions>('vr-options')!

const visible = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  // Sync with the reading progress composable state
  visible.value = readingProgress.showContinuePrompt.value

  if (visible.value && options.autoRedirect.toastDuration > 0) {
    timer = setTimeout(() => {
      readingProgress.dismissContinuePrompt()
      visible.value = false
    }, options.autoRedirect.toastDuration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

function onGo(): void {
  if (timer) clearTimeout(timer)
  readingProgress.goToLastVisited()
  visible.value = false
}

function onDismiss(): void {
  if (timer) clearTimeout(timer)
  readingProgress.dismissContinuePrompt()
  visible.value = false
}
</script>
