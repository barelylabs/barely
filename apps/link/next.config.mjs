/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@barely/config",
    "@barely/env",
    "@barely/lib",
    "@barely/ui",
  ],
};

export default config;
