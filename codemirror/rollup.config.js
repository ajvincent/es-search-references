import pkg from 'typescript';
const { ModuleKind, ModuleResolutionKind, ScriptTarget } = pkg;

import {
  nodeResolve
} from '@rollup/plugin-node-resolve';

import typescript_plugin from '@rollup/plugin-typescript';
import dts_plugin from "rollup-plugin-dts";

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
    input: "./exports.mts",
    output: {
      file: "../docs/lib/packages/CodeMirror.mjs",
      format: "es",
    },
    plugins: [
      typescript_plugin(),
      nodeResolve(),
    ],
  },

  {
    input: "./exports.mts",
    output: {
      file: "../source/lib/packages/CodeMirror.d.mts",
      format: "es",
    },
    plugins: [
      dts_plugin(
        {
          "compilerOptions": {...compilerOptions},
        }
      ),
      nodeResolve(),
    ],
  },
];

export default RollupOptions;
