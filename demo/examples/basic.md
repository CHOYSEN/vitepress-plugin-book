# 基本体验

这个页面展示插件的基础功能。

## 阅读时间

你应该能在页面顶部看到「⏱ 约 X 分钟」的阅读时间预估。它是根据页面正文的字数计算出来的。

## 侧边栏标记

看看左侧侧边栏，每个已浏览过的章节名称前应该有一个绿色的 ✓，未浏览过的显示灰色的 ○。
侧边栏顶部还有一个进度条和「X / Y」的计数器，显示你已读章节数占总章节数的比例。

## 顶部进度条

页面最顶部有一条极细的渐变色条，它的宽度代表整本书的阅读进度。
浏览更多页面后回来，你会发现这条线变长了。

## 回到顶部

向下滚动这个页面超过 300px，右下角会出现一个 ↑ 箭头按钮。点击可以平滑滚回页面顶部。

---

## 另一个代码示例

```typescript
// 一个简单的 LRU Cache 实现
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
}
```

这是一段填充文字，确保页面右下角能触发回到顶部按钮。
插件的回到顶部按钮会在你滚动超过一定像素后自动出现。
默认阈值是 300px，你可以通过 `backToTop.threshold` 调整。

关于侧边栏的阅读标记——它是通过 MutationObserver 注入到 VitePress 默认侧边栏的 DOM 中。
这意味着不需要用户修改侧边栏的渲染逻辑，插件会自动找到每个侧边栏链接并在前面加上状态标记。
