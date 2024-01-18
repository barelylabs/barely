// import "./src/envy.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/image/*",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-ak.spotifycdn.com",
        pathname: "/**",
      },
    ],
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@barely/email",
    "@barely/env",
    "@barely/lib",
    "@barely/ui",
  ],

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  env: {
    // DATABASE_URL: process.env.DATABASE_URL ?? "",
  },
};

export default config;
