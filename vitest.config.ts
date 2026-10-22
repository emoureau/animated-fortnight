import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['app/**/*.{js,ts,vue}'],
      exclude: ['app/**/*.d.ts', '.nuxt/**'],
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'happy-dom',
        },
      },
      {
        test: {
          name: 'api',
          include: ['test/api/**/*.{test,spec}.ts'],
          environment: 'node',
          testTimeout: 60_000,
          hookTimeout: 180_000,
        },
      },
      defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
        },
      }),
    ],
  },
})
