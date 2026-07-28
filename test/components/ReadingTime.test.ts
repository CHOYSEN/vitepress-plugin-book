import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ReadingTime from '../../src/client/components/ReadingTime.vue'

describe('ReadingTime', () => {
  function mountWithOptions(enabled = true, displayText = '约 5 分钟') {
    return mount(ReadingTime, {
      global: {
        provide: {
          'vb-options': {
            readingTime: { enabled },
          } as any,
          'vb-reading-time': {
            displayText: ref(displayText),
          },
        },
      },
    })
  }

  it('renders reading time badge when enabled', () => {
    const wrapper = mountWithOptions(true, '约 8 分钟')
    expect(wrapper.find('.vb-reading-time').exists()).toBe(true)
    expect(wrapper.text()).toContain('约 8 分钟')
  })

  it('does not render when disabled', () => {
    const wrapper = mountWithOptions(false)
    expect(wrapper.find('.vb-reading-time').exists()).toBe(false)
  })

  it('contains the clock emoji', () => {
    const wrapper = mountWithOptions(true)
    expect(wrapper.text()).toContain('⏱')
  })

  it('displays dynamic reading time', () => {
    const wrapper = mountWithOptions(true, '约 12 分钟')
    expect(wrapper.text()).toContain('约 12 分钟')
  })
})
