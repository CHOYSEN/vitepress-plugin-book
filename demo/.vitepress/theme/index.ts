import { withReader } from 'vitepress-plugin-reader/client'
import 'vitepress-plugin-reader/client/style.css'

export default withReader({
  readingTime: { wordsPerMinute: 300 },
  autoRedirect: { toastDuration: 3000 },
})
