import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@react-video-editor/core/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        text: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        base: {
          50: "var(--base-50)",
          100: "var(--base-100)",
          200: "var(--base-200)",
          300: "var(--base-300)",
          400: "var(--base-400)",
          500: "var(--base-500)",
          600: "var(--base-600)",
          700: "var(--base-700)",
          800: "var(--base-800)",
          900: "var(--base-900)",
          950: "var(--base-950)",
          1000: "var(--base-1000)",
        },
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
          1000: "var(--primary-1000)",
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          950: "var(--secondary-950)",
          1000: "var(--secondary-1000)",
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        "border-input": "var(--border)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        "timeline-marker": "var(--timeline-marker)",
        "timeline-marker-hover": "var(--timeline-marker-hover)",
        "timeline-tick": "var(--timeline-tick)",
        "timeline-tick-hover": "var(--timeline-tick-hover)",
        "timeline-ghost": "var(--timeline-ghost)",
        "timeline-row": "var(--timeline-row)",
        "timeline-item-selected-border": "var(--timeline-item-selected-border)",
        "video-overlay": {
          DEFAULT: "var(--video-overlay)",
          foreground: "var(--video-overlay-foreground)",
        },
        "audio-overlay": {
          DEFAULT: "var(--audio-overlay)",
          foreground: "var(--audio-overlay-foreground)",
        },
        "text-overlay": {
          DEFAULT: "var(--text-overlay)",
          foreground: "var(--text-overlay-foreground)",
        },
        "image-overlay": {
          DEFAULT: "var(--image-overlay)",
          foreground: "var(--image-overlay-foreground)",
        },
        "caption-overlay": {
          DEFAULT: "var(--caption-overlay)",
          foreground: "var(--caption-overlay-foreground)",
        },
        "caption-item": {
          DEFAULT: "var(--caption-item)",
          foreground: "var(--caption-item-foreground)",
        },
        "caption-item-active": {
          DEFAULT: "var(--caption-item-active)",
          foreground: "var(--caption-item-active-foreground)",
        },
        "sticker-overlay": {
          DEFAULT: "var(--sticker-overlay)",
          foreground: "var(--sticker-overlay-foreground)",
        },
        "waveform-bar": {
          DEFAULT: "var(--waveform-bar)",
          foreground: "var(--waveform-bar-foreground)",
        },
        interactive: {
          primary: "var(--interactive-primary)",
          "primary-hover": "var(--interactive-primary-hover)",
          hover: "var(--interactive-hover)",
          pressed: "var(--interactive-pressed)",
          disabled: "var(--interactive-disabled)",
        },
        keyframe: {
          pink: "var(--keyframe-pink)",
          "pink-hover": "var(--keyframe-pink-hover)",
          slate: "var(--keyframe-slate)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
          placeholder: "var(--text-placeholder)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          overlay: "var(--surface-overlay)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
