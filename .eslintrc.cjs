// /** @type {import("eslint").Linter.Config} */
// module.exports = {
//   root: true,
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     tsconfigRootDir: __dirname,
//     project: [
//       "./tsconfig.json",
//       "./apps/*/tsconfig.json",
//       "./packages/*/tsconfig.json",
//     ],
//   },
//   plugins: ["@typescript-eslint"],
//   extends: ["plugin:@typescript-eslint/recommended"],
// };

module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
