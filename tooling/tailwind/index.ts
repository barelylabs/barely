import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    borderWidth: {
      DEFAULT: "1.5px",
      0: "0",
      2: "2px",
      3: "3px",
      4: "4px",
      6: "6px",
      8: "8px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        heading: ["var(--font-heading)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "2xs": "0.625rem",
        md: "1rem",
        "tremor-label": ["0.75rem", {}],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      animation: {
        text: "text 5s ease infinite",
        "accordion-up": "accordion-up 0.2s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "bounce-slow": "bounce 2s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      transitionDelay: {
        250: "250ms",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        subtle: {
          DEFAULT: "hsl(var(--subtle))",
          foreground: "hsl(var(--subtle-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        transparent: "transparent",
        current: "currentColor",
        black: colors.black,
        white: colors.white,

        // apps
        "amazon-music": {
          DEFAULT: "#0077C1",
          50: "#E5F5FF",
          100: "#B8E4FF",
          200: "#8AD2FF",
          300: "#5CC0FF",
          400: "#2EAFFF",
          500: "#0077C1",
          600: "#007ECC",
          700: "#005E99",
          800: "#003F66",
          900: "#001F33",
        },
        "amazon-music-alt": {
          DEFAULT: "#0DBFF5",
          50: "#E7F9FE",
          100: "#BAEDFC",
          200: "#8EE1FA",
          300: "#62D6F9",
          400: "#36CAF7",
          500: "#0DBFF5",
          600: "#0898C4",
          700: "#067293",
          800: "#044C62",
          900: "#022631",
        },
        apple: {
          DEFAULT: "#555555",
          50: "#F2F2F2",
          100: "#DBDBDB",
          200: "#C4C4C4",
          300: "#ADADAD",
          400: "#969696",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#1A1A1A",
        },
        deezer: {
          DEFAULT: "#FF0092",
          50: "#FFE5F4",
          100: "#FFB8E0",
          200: "#FF8ACD",
          300: "#FF5CB9",
          400: "#FF2EA6",
          500: "#FF0092",
          600: "#CC0075",
          700: "#990058",
          800: "#66003A",
          900: "#33001D",
        },
        facebook: {
          DEFAULT: "#4267B2",
          blue: "#4267B2",
          50: "#ECF0F8",
          100: "#CBD6EC",
          200: "#A9BBDF",
          300: "#88A1D3",
          400: "#6686C6",
          500: "#456CBA",
          600: "#375695",
          700: "#294170",
          800: "#1C2B4A",
          900: "#0E1625",
        },
        instagram: {
          DEFAULT: "#8a3ab9",
          50: "#F4ECF9",
          100: "#E0C9EE",
          200: "#CCA6E3",
          300: "#B883D8",
          400: "#A560CD",
          500: "#913DC2",
          600: "#74319B",
          700: "#572574",
          800: "#3A184E",
          900: "#1D0C27",
        },
        meta: {
          DEFAULT: "#0668E1",
          50: "#E6F1FE",
          100: "#B9D8FD",
          200: "#8DBFFC",
          300: "#60A5FB",
          400: "#338CFA",
          500: "#0773F8",
          600: "#055CC7",
          700: "#044595",
          800: "#032E63",
          900: "#011732",
        },
        spotify: {
          DEFAULT: "#1DB954",
          50: "#E9FCF0",
          100: "#C1F5D4",
          200: "#9AEFB8",
          300: "#72E99C",
          400: "#4AE380",
          500: "#1DB954",
          600: "#1CB050",
          700: "#15843C",
          800: "#0E5828",
          900: "#072C14",
        },
        tiktok: {
          DEFAULT: "#FF0050",
          50: "#FFE5ED",
          100: "#FFB8CE",
          200: "#FF8AAE",
          300: "#FF5C8F",
          400: "#FF2E6F",
          500: "#FF0050",
          600: "#CC0040",
          700: "#990030",
          800: "#660020",
          900: "#330010",
        },
        twitch: {
          DEFAULT: "#6441A5",
          50: "#F1EDF8",
          100: "#D7CCEB",
          200: "#BDABDE",
          300: "#A38AD1",
          400: "#8969C4",
          500: "#6F48B7",
          600: "#593A92",
          700: "#432B6E",
          800: "#2C1D49",
          900: "#160E25",
        },
        twitter: {
          DEFAULT: "#1DA1F2",
          50: "#E7F5FE",
          100: "#BBE3FB",
          200: "#90D1F9",
          300: "#65BFF6",
          400: "#39ADF4",
          500: "#1DA1F2",
          600: "#0B7CC1",
          700: "#085D91",
          800: "#063E60",
          900: "#031F30",
        },
        youtube: {
          DEFAULT: "#FF0000",
          50: "#FFE5E5",
          100: "#FFB8B8",
          200: "#FF8A8A",
          300: "#FF5C5C",
          400: "#FF2E2E",
          500: "#FF0000",
          600: "#CC0000",
          700: "#990000",
          800: "#660000",
          900: "#330000",
        },

        yellow: {
          DEFAULT: "#FFC734",
          50: "#FFF8E5",
          100: "#FFEBB8",
          200: "#FFDF8A",
          300: "#FFD25C",
          400: "#FFC52E",
          500: "#FFB900",
          600: "#CC9400",
          700: "#996F00",
          800: "#664A00",
          900: "#332500",
        },
        orange: {
          DEFAULT: "#F89B49",
          50: "#FEF2E6",
          100: "#FCD9BA",
          200: "#FBC18E",
          300: "#F9A962",
          400: "#F79036",
          500: "#F67809",
          600: "#C46008",
          700: "#934806",
          800: "#623004",
          900: "#311802",
        },
        pink: {
          DEFAULT: "#EA0D80",
          50: "#FEE7F3",
          100: "#FBBBDD",
          200: "#F990C6",
          300: "#F664B0",
          400: "#F4399A",
          500: "#F20D84",
          600: "#C10B6A",
          700: "#91084F",
          800: "#610535",
          900: "#30031A",
        },
        purple: {
          DEFAULT: "#4b3d98",
          50: "#EEEDF8",
          100: "#D1CCEB",
          200: "#B3ABDD",
          300: "#958BD0",
          400: "#786AC3",
          500: "#5A49B6",
          600: "#483A92",
          700: "#362C6D",
          800: "#241D49",
          900: "#120F24",
        },
        blue: {
          DEFAULT: "#2b8fce",
          50: "#EAF4FB",
          100: "#C4E1F3",
          200: "#9ECDEB",
          300: "#78BAE3",
          400: "#52A6DB",
          500: "#2C92D3",
          600: "#2375A9",
          700: "#1A587F",
          800: "#123B54",
          900: "#091D2A",
        },
        gray: {
          50: "#F2F2F2",
          100: "#F6F6F6",
          200: "#DBDBDB",
          300: "#ADADAD",
          400: "#969696",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#1A1A1A",
        },
        red: {
          DEFAULT: "#EB1B3C",
          50: "#FDE8EB",
          100: "#F9BDC7",
          200: "#F693A3",
          300: "#F2697F",
          400: "#EE3F5B",
          500: "#EA1536",
          600: "#BC102C",
          700: "#8D0C21",
          800: "#5E0816",
          900: "#2F040B",
        },
        green: {
          DEFAULT: "#6CBD42",
          50: "#F0F8EC",
          100: "#D6EDCA",
          200: "#BCE1A8",
          300: "#A1D586",
          400: "#87C964",
          500: "#6CBD42",
          600: "#579735",
          700: "#417227",
          800: "#2B4C1A",
          900: "#16260D",
        },
        limeGreen: {
          DEFAULT: "#BAD532",
          50: "#F8FBEA",
          100: "#EBF3C4",
          200: "#DEEB9E",
          300: "#D1E378",
          400: "#C5DB51",
          500: "#B8D42B",
          600: "#93A923",
          700: "#6E7F1A",
          800: "#4A5511",
          900: "#252A09",
        },
        teal: {
          DEFAULT: "2AB6A2",
          50: "#EAFAF8",
          100: "#C5F2EB",
          200: "#A0E9DF",
          300: "#7AE0D2",
          400: "#55D8C5",
          500: "#30CFB8",
          600: "#26A694",
          700: "#1D7C6F",
          800: "#13534A",
          900: "#0A2925",
        },
        cyan: {
          DEFAULT: "#70CFEC",
          50: "#E8F7FC",
          100: "#C0EAF7",
          200: "#97DCF1",
          300: "#6FCFEC",
          400: "#46C1E6",
          500: "#1EB3E1",
          600: "#1890B4",
          700: "#126C87",
          800: "#0C485A",
          900: "#06242D",
        },

        // light mode
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229", // custom
            muted: "#172554", // blue-950
            subtle: "#1e40af", // blue-800
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#60a5fa", // blue-400
            inverted: "#030712", // gray-950
          },
          background: {
            muted: "#131A2B", // custom
            subtle: "#1f2937", // gray-800
            DEFAULT: "#111827", // gray-900
            emphasis: "#d1d5db", // gray-300
          },
          border: {
            DEFAULT: "#374151", // gray-700
          },
          ring: {
            DEFAULT: "#1f2937", // gray-800
          },
          content: {
            subtle: "#4b5563", // gray-600
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#e5e7eb", // gray-200
            strong: "#f9fafb", // gray-50
            inverted: "#000000", // black
          },
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      letterSpacing: {
        normal: "-.025em",
      },
      maxWidth: {
        xs: "18rem",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("@headlessui/tailwindcss"),
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar-hide"),
    require("tailwindcss-radix"),
  ],
} satisfies Config;
