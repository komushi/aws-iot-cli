/*
// commonjs will destroy the default
// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import shebang from 'rollup-plugin-add-shebang';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.js',
      // format: 'cjs'     
    }
  ],  
  plugins: [ 
    commonjs(),
    // terser(),
    shebang({
      include: 'dist/bundle.js'
    })
  ]
};
*/

import cjs from "rollup-plugin-cjs-es";
import {terser} from 'rollup-plugin-terser';
import shebang from 'rollup-plugin-add-shebang';

export default {
  input: 'src/index.js',
  output: {
    dir: "dist",
    format: "cjs"
  },
  external: [ 
    'fs',
    'yargs',
    'aws-sdk',
    '@aws-amplify/core',
    '@aws-amplify/Auth',
    '@aws-amplify/PubSub',
    '@aws-amplify/pubsub/lib/Providers',
    'shortid',
    'node-fetch',
    'ws',
    'os',
    'path',
  ],
  plugins: [ 
    cjs({
      nested: true
    }),
    terser(),
    shebang({
      include: 'dist/index.js'
    })    
  ]
};