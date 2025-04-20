import {
  nodeResolve
} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const RollupOptions = [
  {
    input: "./node_modules/@dagrejs/graphlib/index.js",
    output: {
      file: "./docs/lib/packages/graphlib.mjs",
      format: "es",
    },
    plugins: [
      nodeResolve(),
      commonjs(),
    ],
  },
];

export default RollupOptions;
