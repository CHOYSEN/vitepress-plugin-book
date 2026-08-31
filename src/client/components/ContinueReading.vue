<template>
  <Teleport to="body">
    <Transition name="vb-toast">
      <div v-if="visible" class="vb-continue-reading" role="alert">
        <div class="vb-continue-reading__content">
          <span class="vb-continue-reading__icon">📖</span>
          <span class="vb-continue-reading__text"> 继续阅读上次的章节？ </span>
        </div>
        <div class="vb-continue-reading__actions">
          <button class="vb-btn vb-btn--primary" @click="onGo">继续</button>
          <button class="vb-btn vb-btn--ghost" @click="onDismiss" aria-label="关闭">✕</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';
import type { ResolvedReaderOptions } from '../types';
import { useRouter } from 'vitepress';

const readingProgress = inject<any>('vb-reading-progress')!;
const options = inject<ResolvedReaderOptions>('vb-options')!;
const visible = ref(false);
const { route } = useRouter();

let timer: ReturnType<typeof setTimeout> | null = null;

function startTimer() {
  if (options.autoRedirect.toastDuration <= 0) return
  timer = setTimeout(() => {
      visible.value = false;
      timer = null;
    }, options.autoRedirect.toastDuration);
}

function onMouseMove () {
  if (!visible.value) return;
  startTimer()
  document.removeEventListener('mousemove', onMouseMove);
}

onMounted(() => {
  if (
    options.autoRedirect.enabled &&
    readingProgress.lastVisitedPage.value &&
    readingProgress.lastVisitedPage.value !== route.path
  ) {
    visible.value = true;
  }

  document.addEventListener('mousemove',onMouseMove)
});

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove);
  if (timer) clearTimeout(timer);
})

function onGo(): void {
  if (timer) clearTimeout(timer);
  readingProgress.goToLastVisited();
  visible.value = false;
}

function onDismiss(): void {
  if (timer) clearTimeout(timer);
  visible.value = false;
}
</script>
