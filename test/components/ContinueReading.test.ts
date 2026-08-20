import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import ContinueReading from '../../src/client/components/ContinueReading.vue';

describe('ContinueReading', () => {
  afterEach(() => {
    // Clean up any Teleported content in the body
    document.body.innerHTML = '';
  });

  it('renders toast when showContinuePrompt is true', async () => {
    mount(ContinueReading, {
      global: {
        provide: {
          'vb-options': {
            autoRedirect: { enabled: true, toastDuration: 5000 },
          } as any,
          'vb-reading-progress': {
            showContinuePrompt: ref(true),
            dismissContinuePrompt: () => {},
            goToLastVisited: () => {},
          },
        },
      },
      attachTo: document.body,
    });
    await nextTick();
    expect(document.querySelector('.vb-continue-reading')).toBeTruthy();
  });

  it('does not render toast when showContinuePrompt is false', async () => {
    mount(ContinueReading, {
      global: {
        provide: {
          'vb-options': {
            autoRedirect: { enabled: true, toastDuration: 5000 },
          } as any,
          'vb-reading-progress': {
            showContinuePrompt: ref(false),
            dismissContinuePrompt: () => {},
            goToLastVisited: () => {},
          },
        },
      },
      attachTo: document.body,
    });
    await nextTick();
    expect(document.querySelector('.vb-continue-reading')).toBeNull();
  });

  it('renders Chinese text with both buttons', async () => {
    mount(ContinueReading, {
      global: {
        provide: {
          'vb-options': {
            autoRedirect: { enabled: true, toastDuration: 5000 },
          } as any,
          'vb-reading-progress': {
            showContinuePrompt: ref(true),
            dismissContinuePrompt: () => {},
            goToLastVisited: () => {},
          },
        },
      },
      attachTo: document.body,
    });
    await nextTick();
    const toast = document.querySelector('.vb-continue-reading')!;
    expect(toast.textContent).toContain('继续阅读上次的章节？');
    expect(toast.textContent).toContain('继续');
    expect(toast.querySelector('.vb-btn--primary')).toBeTruthy();
    expect(toast.querySelector('.vb-btn--ghost')).toBeTruthy();
  });
});
