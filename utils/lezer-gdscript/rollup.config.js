import {nodeResolve} from '@rollup/plugin-node-resolve';

export default {
  input: './src/parser.js',
  output: {
    format: 'es',
    file: './dist/index.js',
  },
  external(id) {
    return id.startsWith('@lezer');
  },
  plugins: [nodeResolve()],
};
