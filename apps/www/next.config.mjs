// import * as dotenv from 'dotenv';

// dotenv.config({ path: '../../.env' });

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  transpilePackages: [
    "@barely/db",
    "@barely/config",
    "@barely/lib",
    "@barely/ui",
  ],
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/link",
        permanent: false,
      },
    ];
  },
};

export default config;
