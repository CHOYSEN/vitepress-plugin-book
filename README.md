# vitepress-plugin-book

📖 VitePress 阅读增强插件 —— 为 VitePress 部署的开源书籍提供电子书级别的阅读体验。

## 功能

- **阅读进度记忆** — 自动记住上次读到的章节，下次打开时提示"继续阅读？"
- **滚动位置记忆** — 精确记住每个页面的滚动位置，切换页面后回到原处
- **侧边栏阅读标记** — 每个章节前显示已读 ✓ / 未读 ○ 标记
- **阅读进度条** — 页面顶部显示整本书的阅读进度百分比
- **阅读时间预估** — 每页显示预估阅读时长
- **回到顶部按钮** — 长页面右下角浮动按钮，一键返回顶部
- **代码块复制** — 鼠标悬停代码块显示复制按钮
- **阅读统计** — 记录累计阅读页数、阅读时长、连续阅读天数

所有数据存储在浏览器 `localStorage` 中，无需后端。

## 安装

```bash
npm install vitepress-plugin-book
```

## 使用

### 最简配置

**`.vitepress/theme/index.ts`**：

```ts
import { withReader } from 'vitepress-plugin-book/client'
import 'vitepress-plugin-book/client/style.css'

export default withReader()
```

三行代码即可激活所有功能（使用默认配置）。

### 自定义配置

```ts
import { withReader } from 'vitepress-plugin-book/client'
import 'vitepress-plugin-book/client/style.css'

export default withReader({
  autoRedirect: {
    toastDuration: 3000,     // Toast 3秒后自动消失
  },
  readingTime: {
    wordsPerMinute: 300,     // 中文阅读速度可调高
  },
  backToTop: {
    threshold: 500,          // 滚动500px后才显示按钮
  },
})
```

## 配置项

```ts
interface ReaderOptions {
  readingProgress?: {
    enabled?: boolean           // 默认: true
    storageKey?: string         // 默认: 'vitepress-book:progress'
  }
  scrollMemory?: {
    enabled?: boolean           // 默认: true
    throttleMs?: number         // 默认: 500
    storageKey?: string         // 默认: 'vitepress-book:scroll'
  }
  sidebarMarkers?: {
    enabled?: boolean           // 默认: true
  }
  readingTime?: {
    enabled?: boolean           // 默认: true
    wordsPerMinute?: number     // 默认: 200
    languages?: Record<string, number>  // 语言级 WPM 覆盖
  }
  backToTop?: {
    enabled?: boolean           // 默认: true
    threshold?: number          // 默认: 300 (px)
  }
  codeCopy?: {
    enabled?: boolean           // 默认: true
  }
  readingStats?: {
    enabled?: boolean           // 默认: true
    storageKey?: string         // 默认: 'vitepress-book:stats'
  }
  autoRedirect?: {
    enabled?: boolean           // 默认: true
    toastDuration?: number      // 默认: 5000 (ms), 设 0 则直接跳转不显示 toast
  }
}
```

## 高级用法

### 手动注册组件

如果你需要更细粒度的控制，可以使用 Vue 插件方式手动注册：

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import {
  VitepressReaderPlugin,
  ProgressBar,
  BackToTop,
  CodeCopyButton,
} from 'vitepress-plugin-book/client'
import 'vitepress-plugin-book/client/style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ProgressBar),
      'doc-after': () => h(BackToTop),
    })
  },
  enhanceApp({ app }) {
    app.use(VitepressReaderPlugin, {
      readingTime: { wordsPerMinute: 300 },
    })
  },
}
```

### 关闭特定功能

```ts
export default withReader({
  codeCopy: { enabled: false },     // 关闭代码复制（主题已有）
  sidebarMarkers: { enabled: false }, // 关闭侧边栏标记
})
```

## 兼容性

- VitePress >= 1.0.0
- Vue >= 3.3.0
- 所有现代浏览器（Chrome、Firefox、Safari、Edge）

## License

MIT
