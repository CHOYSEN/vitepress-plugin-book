import { onMounted, onUnmounted, watch, nextTick } from 'vue';

import { useRouter } from 'vitepress';

import { store } from '../store';

import type { ResolvedReaderOptions } from '../types';

export function useScrollMemory(options: ResolvedReaderOptions) {
  const { route } = useRouter();

  const { storageKey, throttleMs } = options.scrollMemory;

  let timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 保存滚动位置
   */
  function saveScroll(path = route.path) {
    if (typeof window === 'undefined') return;

    store.setScroll(storageKey, path, window.scrollY);
  }

  /**
   * 恢复滚动
   */
  async function restoreScroll(path: string) {
    if (typeof window === 'undefined') return;

    // 有hash交给浏览器处理
    if (window.location.hash) {
      return;
    }

    const y = store.getScroll(storageKey, path);

    if (!y) return;

    await nextTick();
    window.scrollTo({ top: y, behavior: 'auto' });
  }

  function handleScroll() {
    if (timer) return;

    timer = setTimeout(() => {
      timer = null;
      saveScroll();
    }, throttleMs);
  }

  function beforeUnload() {
    saveScroll();
  }

  onMounted(() => {
    if (typeof window === 'undefined') return;

    restoreScroll(route.path);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', beforeUnload);
  });

  watch(
    () => route.path,
    async (newPath, oldPath) => {
      if (oldPath) {
        saveScroll(oldPath);
      }
      await restoreScroll(newPath);
    },
  );

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);

    window.removeEventListener('beforeunload', beforeUnload);

    if (timer) {
      clearTimeout(timer);
    }
  });

  return {
    saveScroll,
    restoreScroll,
  };
}
