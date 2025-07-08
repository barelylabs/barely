import baseConfig from '@barely/eslint-config/base';

/** @type {import('typescript-eslint').Config} */
export default [{ ignores: ['_migrations/**'] }, ...baseConfig];
