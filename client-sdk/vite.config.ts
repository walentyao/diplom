import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MonitoringSDK',
      fileName: 'monitoring-sdk',
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});