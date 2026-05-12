import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/zorix.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve({ browser: true }), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/zorix.cjs',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/zorix.iife.js',
      format: 'iife',
      name: 'zorix',
      sourcemap: true,
    },
    plugins: [resolve({ browser: true }), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
