// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
    transpilePackages: [
      "@barely/api",
      "@barely/auth",
      "@barely/db",
      "@barely/tailwind-config",
      "@barely/ts-config",
    ],
  },
  // We already do linting on GH actions
  // eslint: {
  //   ignoreDuringBuilds: !!process.env.CI,
  // },
};

export default config;
