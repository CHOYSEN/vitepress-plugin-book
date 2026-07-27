# 安装与使用

## 安装

```bash
pnpm add vitepress-plugin-book
```

## 最简配置

在 `.vitepress/theme/index.ts` 中：

```ts
import { withReader } from 'vitepress-plugin-book/client'
import 'vitepress-plugin-book/client/style.css'

export default withReader()
```

三行代码即可激活所有 8 个功能。

## 代码块复制功能演示

下面这些代码块都可以复制——把鼠标悬停在代码块上，右上角会出现一个复制按钮：

```python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    if n == 1:
        return [0]

    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq


# 打印前 10 个斐波那契数
print(fibonacci(10))
# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

```javascript
// 深拷贝一个对象
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))

  const cloned = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}
```

```bash
#!/bin/bash
# 批量重命名文件
for file in *.txt; do
  mv "$file" "${file%.txt}.md"
  echo "Renamed: $file -> ${file%.txt}.md"
done
```

## 另一种集成方式：手动注册组件

如果不想用 `withReader()` 的默认布局，可以手动将组件注入到 VitePress 的 Layout Slot 中：

```ts
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

这种用法适合需要精细控制每个组件注入位置的场景。
