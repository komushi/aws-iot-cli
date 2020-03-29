// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'cjs'
    }
  ],
  external: [
    'fs'
  ],   
  plugins: [ 
    commonjs(),
    terser()
  ]
};