/*
 * This file is not used for any compilation purpose, it is only used
 * for Tailwind Intellisense & Autocompletion in the source files
 */
import type { Config } from "tailwindcss";
import baseConfig from "@barely/tailwind-config";

export default {
  content: [
    "./elements/**/*.{ts,tsx}",
    "./charts/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./forms/**/*.{ts,tsx}",
    "../../node_modules/@tremor/**/*.{js,ts,jsx,tsx}", // Tremor module
  ],
  presets: [baseConfig],
} satisfies Config;
