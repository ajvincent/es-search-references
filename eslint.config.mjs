// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{
		files: [
      "source/scripts/**/*.ts",
      "source/tests/**/*.ts",
    ],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
