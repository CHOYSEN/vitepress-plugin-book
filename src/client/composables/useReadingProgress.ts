import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vitepress';
import { store } from '../store';
import type { ResolvedReaderOptions } from '../types';
import { useSidebarData } from './useSidebarData';

/**
 * Track which pages have been read and provide progress percentage.
 * Also handles the "continue where you left off" experience.
 */
export function useReadingProgress(options: ResolvedReaderOptions) {
  const { route } = useRouter();
  const router = useRouter();
  const { allPagesSet } = useSidebarData();

  const { storageKey } = options.readingProgress;

  const data = store.getProgress(storageKey);

  const readPages = ref<string[]>(data.readPages);
  const lastVisitedPage = ref<string>(data.lastVisitedPage);
  const lastVisitedAt = ref<number>(data.lastVisitedAt);
  const currentReadingPage = ref('');
  let timer: ReturnType<typeof setTimeout> | null = null;

  function saveState(): void {
    store.setProgress(storageKey, {
      readPages: readPages.value,
      lastVisitedPage: lastVisitedPage.value,
      lastVisitedAt: lastVisitedAt.value,
    });
  }

  /**
   * 更新最近访问页面
   * 只表示访问过，不代表已读完成
   */
  function updateLastVisited(path: string): void {
    lastVisitedPage.value = path;
    lastVisitedAt.value = Date.now();

    saveState();
  }

  function markAsRead(path: string): void {
    if (!readPages.value.includes(path)) {
      readPages.value = [...readPages.value, path];
    }

    saveState();
  }

  /**
   * 获取当前滚动比例
   */
  function getScrollPercent(): number {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) {
      return 1;
    }
    return scrollTop / scrollHeight;
  }

  /**
   * 检查是否阅读完成
   */
  function checkReadComplete(): void {
    const path = currentReadingPage.value;

    if (!path) {
      return;
    }

    if (isPageRead(path)) {
      return;
    }

    const percent = getScrollPercent();

    if (percent >= 0.8) {
      markAsRead(path);

      cleanupReaderListener();
    }
  }

  /**
   * 开始阅读监听
   */
  function startReadingTrack(path: string): void {
    currentReadingPage.value = path;

    // 停留10秒认为阅读完成
    timer = setTimeout(() => {
      markAsRead(path);

      cleanupReaderListener();
    }, 10000);

    window.addEventListener('scroll', checkReadComplete, {
      passive: true,
    });
  }

  /**
   * 清理监听
   */
  function cleanupReaderListener(): void {
    if (timer) {
      clearTimeout(timer);

      timer = null;
    }

    window.removeEventListener('scroll', checkReadComplete);
  }

  /**
   * 判断是否已读
   */
  function isPageRead(path: string): boolean {
    return readPages.value.includes(path);
  }

  /**
   * 阅读进度
   */
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
    if (target && target !== route.path) {
      router.go(target);
    }
  }

  /**
   * 初始化
   */
  onMounted(() => {
    const currentPath = route.path;

    // 继续阅读跳转
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

  /**
   * SPA路由变化
   */
  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (oldPath && newPath !== oldPath) {
        // 用户真正进入新的页面
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
    isPageRead,
    markAsRead,
    lastVisitedPage,
    lastVisitedAt,
    goToLastVisited,
  };
}
