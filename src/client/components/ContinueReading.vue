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

onMounted(() => {
  // Sync with the reading progress composable state
  if (
    options.autoRedirect.enabled &&
    readingProgress.lastVisitedPage.value &&
    readingProgress.lastVisitedPage.value !== route.path
  ) {
    visible.value = true;
  }

  if (visible.value && options.autoRedirect.toastDuration > 0) {
    timer = setTimeout(() => {
      visible.value = false;
    }, options.autoRedirect.toastDuration);
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

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
