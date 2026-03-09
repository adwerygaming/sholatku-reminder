import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['**/*.ts', '!**/*.spec.ts', '!node_modules/**', '!dist/**'],
    outDir: 'dist',
    format: ['esm'],
    target: 'es2023',
    sourcemap: false,
    dts: false,
    clean: true,
    bundle: false,
    splitting: false,
});