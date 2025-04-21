import pkg from 'typescript';
const { ModuleKind, ModuleResolutionKind, ScriptTarget } = pkg;

import {
  nodeResolve
} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from "rollup-plugin-dts";

const compilerOptions = {
  "lib": ["lib.es2024.d.ts"],
  "module": ModuleKind.ES2022,
  "target": ScriptTarget.ES2022,
  "moduleResolution": ModuleResolutionKind.Bundler,

  "baseUrl": ".",

  "strict": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true,
};

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

  {
    input: "./node_modules/@dagrejs/graphlib/index.d.ts",
    output: {
      file: "./source/lib/packages/graphlib.d.mts",
      format: "es",
    },
    plugins: [
      dts(
        {
          "compilerOptions": {...compilerOptions},
        }
      ),
      nodeResolve(),
      commonjs(),
    ],
  },
];

export default RollupOptions;
