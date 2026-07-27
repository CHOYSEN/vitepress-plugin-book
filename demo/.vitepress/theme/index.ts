import { withReader } from 'vitepress-plugin-book/client'
import 'vitepress-plugin-book/client/style.css'

export default withReader({
  readingTime: { wordsPerMinute: 300 },
  autoRedirect: { toastDuration: 3000 },
})
