import { ref, computed, onMounted, watch, onUnmounted, inject } from 'vue';
import { useRouter } from 'vitepress';
import { store } from '../store';
import type { ResolvedReaderOptions } from '../types';
import { useSidebarData } from './useSidebarData';

/**
 * Track which pages have been read and provide progress percentage.
 * Also handles the "continue where you left off" experience.
 */
export function useReadingProgress(options: ResolvedReaderOptions) {
  const sidebarData = inject<any>("vb-sidebar-data")!;
  const { route } = useRouter();
  const router = useRouter();
  const { allPagesSet } = useSidebarData();

  const { storageKey } = options.readingProgress;

  const data = store.getProgress(storageKey);

  const readPages = ref<string[]>(data.readPages);
  const readingProgress = ref<Record<string, number>>(
    data.readingProgress ?? {}
  );
  const lastVisitedPage = ref<string>(data.lastVisitedPage);
  const lastVisitedAt = ref<number>(data.lastVisitedAt);
  const currentReadingPage = ref('');
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scrollHandler: (() => void) | null = null;

  function saveState(): void {
    store.setProgress(storageKey, {
      readPages: readPages.value,
      readingProgress: readingProgress.value,
      lastVisitedPage: lastVisitedPage.value,
      lastVisitedAt: lastVisitedAt.value,
    });
  }


  function updateLastVisited(path: string): void {
    lastVisitedPage.value = path;
    lastVisitedAt.value = Date.now();

    saveState();
  }

  function normalizePath(path: string) {
    return path.replace(/\/$/, "").replace(/\.html$/, "");
  }

  function markAsRead(path: string): void {
    const normalPath = normalizePath(path)

    if (!readPages.value.includes(normalPath)) {
      readPages.value = [...readPages.value, normalPath];
    }

    saveState();
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  function updateReadingProgress(path: string): void {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    const percent = scrollHeight <= 0 ? 1 : Math.min(scrollTop / scrollHeight, 1)

    readingProgress.value[path] = Math.max(
      readingProgress.value[path] ?? 0,
      document.documentElement.scrollTop || document.body.scrollTop
    );

    console.log('persent', percent)

    if (percent >= 0.9) {
      markAsRead(path);
      return;
    }

    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(() => {
      saveState();
    }, 300);
  }


  function startReadingTrack(path: string): void {
    currentReadingPage.value = path;

    scrollHandler = () => {
      updateReadingProgress(path);
    };

    window.addEventListener(
      'scroll',
      scrollHandler,
      {
        passive: true,
      }
    );
  }

  function cleanupReaderListener(): void {
    if (!scrollHandler) {
      return;
    }

    window.removeEventListener(
      'scroll',
      scrollHandler
    );

    scrollHandler = null;
  }

  const progress = computed(() => {
    if (allPagesSet.value.size === 0) {
      return 0;
    }

    const readCount = readPages.value.filter((p) => allPagesSet.value.has(p)).length;
    return Math.round((readCount / allPagesSet.value.size) * 100);
  });

  /**
   * 跳转到上次阅读页面
   */
  function goToLastVisited(): void {
    const target = lastVisitedPage.value;
    console.log('target>>', target)
    console.log('route.path', route.path)
    if (target && target !== route.path) {
      router.go(target);
    }
  }

  /**
   * 初始化
   */
  onMounted(() => {
    const currentPath = normalizePath(route.path);
    console.log(currentPath, 'current')

    if (
      options.autoRedirect.enabled &&
      lastVisitedPage.value &&
      lastVisitedPage.value !== currentPath
    ) {
      if (options.autoRedirect.toastDuration === 0) {
        router.go(lastVisitedPage.value);
        return;
      }
    }
    startReadingTrack(currentPath);
  });

  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (oldPath && newPath !== oldPath) {
        // 用户真正进入新的页面
        // const normaPath = normalizePath(newPath)
        updateLastVisited(newPath);
        cleanupReaderListener();
        startReadingTrack(newPath);
      }
    },
  );

  onUnmounted(() => {
    cleanupReaderListener();
  });

  return {
    readPages,
    progress,
    readingProgress,
    markAsRead,
    lastVisitedPage,
    lastVisitedAt,
    goToLastVisited,
  };
}
