import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/locales/*/index.ts',
    'src/adapters/*/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  bundle: true,
  external: ['compromise', 'libphonenumber-js', 'validator', 'zod'],
  esbuildOptions(options) {
    options.conditions = ['module']
  }
})