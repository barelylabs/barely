import type { Config } from "tailwindcss";
import baseConfig from "@barely/tailwind-config";

export default {
  content: [
    ...baseConfig.content,
    "../../packages/ui/**/*.{ts,tsx}",
    "../../node_modules/@tremor/**/*.{js,ts,jsx,tsx}", // Tremor module
  ],
  presets: [baseConfig],
} satisfies Config;
