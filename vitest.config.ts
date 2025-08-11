import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const ENV_PREFIX = 'REACT_APP_';

const ONE_SECOND = 1000; // ms

const TEST_TIMEOUT = 30 * ONE_SECOND; // 30 seconds

export default defineConfig(({ mode }) => {
  loadEnv(mode, 'env', ENV_PREFIX);

  return {
    test: {
      fileParallelism: true,
      testTimeout: TEST_TIMEOUT,
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      alias: [
        {
          find: new RegExp(/^@bufbuild\/buf$/g),
          replacement: '@bufbuild/protobuf/dist/esm/index.js',
        },
      ],
      reporters: ['default', 'html'],
      typecheck: {
        enabled: true,
      },
      coverage: {
        enabled: false,
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/proto/**/*'],
      },
    },
    resolve: {
      preserveSymlinks: true,
    },
  };
});
