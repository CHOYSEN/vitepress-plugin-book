import { h } from 'vue';

// Minimal mock of DefaultTheme
export const DefaultTheme = {
  Layout: {
    name: 'DefaultLayout',
    setup() {},
    render() {
      return h('div', { class: 'vp-layout' });
    },
  },
};
export default DefaultTheme;
