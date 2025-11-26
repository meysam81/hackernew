import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://meysam81.github.io',
  base: '/hackernew',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['ky']
    }
  }
});
