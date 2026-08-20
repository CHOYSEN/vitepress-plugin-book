# 自定义配置

## 配置结构

`withReader()` 接受一个可选的配置对象。所有字段都有合理的默认值，你可以只覆盖需要的部分。

```ts
withReader({
  readingProgress: { enabled: true }, // 阅读进度追踪
  scrollMemory: { throttleMs: 500 }, // 滚动位置记忆
  sidebarMarkers: { enabled: true }, // 侧边栏已读标记
  readingTime: { wordsPerMinute: 200 }, // 阅读时间预估
  backToTop: { threshold: 300 }, // 回到顶部按钮
  codeCopy: { enabled: true }, // 代码块复制
  readingStats: { enabled: true }, // 阅读统计
  autoRedirect: { toastDuration: 5000 }, // 自动跳转
});
```

## 中文阅读速度

中文每个字符的信息密度比英文单词高，默认的中文阅读速度是 300 字/分钟。
你可以根据你的读者群体调整：

```ts
withReader({
  readingTime: {
    wordsPerMinute: 200,
    languages: {
      zh: 400, // 中文：400 字/分钟
      ja: 350, // 日文：350 字/分钟
      en: 200, // 英文：200 词/分钟
    },
  },
});
```

## 自动跳转行为

```ts
// 显示 Toast 3 秒后自动消失（默认 5 秒）
withReader({ autoRedirect: { toastDuration: 3000 } });

// 不显示 Toast，直接跳转
withReader({ autoRedirect: { toastDuration: 0 } });

// 完全关闭自动跳转提示
withReader({ autoRedirect: { enabled: false } });
```

## 回到顶部按钮

```ts
// 滚动超过 500px 才显示按钮
withReader({ backToTop: { threshold: 500 } });
```

## 关闭不需要的功能

如果 VitePress 主题已经自带了某些功能，可以单独关闭：

```ts
withReader({
  codeCopy: { enabled: false }, // 主题已有代码复制按钮
  backToTop: { enabled: false }, // 不需要回到顶部
});
```

## localStorage 存储

所有数据存储在浏览器 `localStorage` 中，命名空间为 `vitepress-book:`。
你可以自定义存储键名以避免与其他插件冲突：

```ts
withReader({
  readingProgress: { storageKey: 'my-app:reader-progress' },
  scrollMemory: { storageKey: 'my-app:reader-scroll' },
  readingStats: { storageKey: 'my-app:reader-stats' },
});
```
