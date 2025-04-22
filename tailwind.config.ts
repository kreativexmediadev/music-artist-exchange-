import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#111729',
          card: '#1D2839',
        },
        accent: {
          yellow: '#FFC600',
          yellowHover: '#FFD133',
        },
      },
    },
  },
  plugins: [],
}

export default config 