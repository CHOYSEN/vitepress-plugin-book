import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackToTop from '../../src/client/components/BackToTop.vue'

describe('BackToTop', () => {
  function mountWithOptions(enabled = true) {
    return mount(BackToTop, {
      global: {
        provide: {
          'vb-options': {
            backToTop: { enabled, threshold: 300 },
          } as any,
        },
      },
    })
  }

  it('renders when enabled', () => {
    const wrapper = mountWithOptions(true)
    // Element exists in the DOM (hidden by v-show since scrollY = 0)
    expect(wrapper.find('.vb-back-to-top').exists()).toBe(true)
  })

  it('does not render when disabled', () => {
    const wrapper = mountWithOptions(false)
    expect(wrapper.find('.vb-back-to-top').exists()).toBe(false)
  })

  it('has correct aria-label', () => {
    const wrapper = mountWithOptions(true)
    expect(wrapper.find('.vb-back-to-top').attributes('aria-label')).toBe('回到顶部')
  })

  it('contains an SVG icon', () => {
    const wrapper = mountWithOptions(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
