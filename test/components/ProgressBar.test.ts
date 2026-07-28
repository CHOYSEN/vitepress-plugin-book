import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ProgressBar from '../../src/client/components/ProgressBar.vue'

describe('ProgressBar', () => {
  function mountWithOptions(enabled = true) {
    return mount(ProgressBar, {
      global: {
        provide: {
          'vb-options': {
            readingProgress: { enabled },
          } as any,
          'vb-reading-progress': {
            progress: ref(42),
          },
        },
      },
    })
  }

  it('renders progress bar when enabled', () => {
    const wrapper = mountWithOptions(true)
    expect(wrapper.find('.vb-progress-bar').exists()).toBe(true)
  })

  it('does not render when disabled', () => {
    const wrapper = mountWithOptions(false)
    expect(wrapper.find('.vb-progress-bar').exists()).toBe(false)
  })

  it('has correct aria attributes', () => {
    const wrapper = mountWithOptions(true)
    const bar = wrapper.find('.vb-progress-bar')
    expect(bar.attributes('role')).toBe('progressbar')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('100')
  })

  it('reflects progress value in aria-valuenow', () => {
    const wrapper = mountWithOptions(true)
    expect(wrapper.find('.vb-progress-bar').attributes('aria-valuenow')).toBe('42')
  })
})
