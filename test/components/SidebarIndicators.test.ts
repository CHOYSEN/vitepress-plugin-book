import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import SidebarIndicators from '../../src/client/components/SidebarIndicators.vue';

describe('SidebarIndicators', () => {
  function mountWithOptions(enabled = true, readPages: string[] = ['/a', '/b']) {
    return mount(SidebarIndicators, {
      global: {
        provide: {
          'vb-options': {
            sidebarMarkers: { enabled },
          } as any,
          'vb-reading-progress': {
            readPages: ref(readPages),
          },
          'vb-sidebar-data': {
            allPages: ref(['/a', '/b', '/c', '/d', '/e']),
            totalPages: ref(5),
            sidebarItems: ref([
              { text: 'A', link: '/a', isRead: true },
              { text: 'B', link: '/b', isRead: false },
            ]),
          },
        },
      },
    });
  }

  it('renders sidebar panel when enabled', () => {
    const wrapper = mountWithOptions(true);
    expect(wrapper.find('.vb-sidebar-indicators').exists()).toBe(true);
  });

  it('does not render when disabled', () => {
    const wrapper = mountWithOptions(false);
    expect(wrapper.find('.vb-sidebar-indicators').exists()).toBe(false);
  });

  it('shows correct read count (x / total)', () => {
    const wrapper = mountWithOptions(true, ['/a', '/b', '/c']);
    expect(wrapper.find('.vb-sidebar-indicators__count').text()).toBe('3 / 5');
  });

  it('shows zero when no pages read', () => {
    const wrapper = mountWithOptions(true, []);
    expect(wrapper.find('.vb-sidebar-indicators__count').text()).toBe('0 / 5');
  });

  it('shows progress bar at 60%', () => {
    const wrapper = mountWithOptions(true, ['/a', '/b', '/c']);
    const fill = wrapper.find('.vb-sidebar-indicators__bar-fill');
    expect(fill.attributes('style')).toContain('width: 60%');
  });

  it('shows 0% with no pages read', () => {
    const wrapper = mountWithOptions(true, []);
    expect(wrapper.find('.vb-sidebar-indicators__bar-fill').attributes('style')).toContain(
      'width: 0%',
    );
  });

  it('shows 100% when all pages read', () => {
    const wrapper = mountWithOptions(true, ['/a', '/b', '/c', '/d', '/e']);
    expect(wrapper.find('.vb-sidebar-indicators__bar-fill').attributes('style')).toContain(
      'width: 100%',
    );
  });

  it('shows Chinese label', () => {
    const wrapper = mountWithOptions(true);
    expect(wrapper.find('.vb-sidebar-indicators__label').text()).toBe('阅读进度');
  });

  it('renders sidebar markers from reactive sidebar item data', () => {
    const wrapper = mountWithOptions(true);
    expect(wrapper.findAll('.vb-sidebar-indicators__item')).toHaveLength(2);
    expect(wrapper.find('.vb-sidebar-dot--read').exists()).toBe(true);
    expect(wrapper.find('.vb-sidebar-dot--unread').exists()).toBe(true);
  });
});
