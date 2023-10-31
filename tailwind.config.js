/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  content: ['./components/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lightGreen: {
          50: '#f5faf2',
          100: '#f2f8ef',
          200: '#f0f7ec',
          300: '#eef6e9',
          400: '#ecf5e7',
          500: '#eaf4e4', // default
          600: '#d3dccd',
          700: '#bbc3b6',
          800: '#a4aba0',
          900: '#8c9289',
          950: '#757a72',
        },
        darkGreen: {
          50: '#b3b8b0',
          100: '#a3aaa0',
          200: '#949c90',
          300: '#858d80',
          400: '#757f70',
          500: '#667160', // default
          600: '#5c6656',
          700: '#525a4d',
          800: '#474f43',
          900: '#3d443a',
          950: '#333930',
        },
        palePink: {
          50: '#FFEEF8',
          100: '#FFDAF0', // default
          200: '#FFA2D9',
          300: '#FF6AC3',
          400: '#FF32AC',
          500: '#F90094',
          600: '#C10072',
          700: '#880051',
          800: '#500030',
          900: '#18000E',
          950: '#000000',
        },
        coralRed: {
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FEF7F7',
          300: '#F9D3D5',
          400: '#F3B0B2',
          500: '#EE8C90', // default
          600: '#E75B61',
          700: '#E02A32',
          800: '#B71B21',
          900: '#861418',
          950: '#6D1014',
        },
        lightTurquoise: {
          50: '#FFFFFF',
          100: '#EEFCFF',
          200: '#C5F4FF', // default
          300: '#8DE9FF',
          400: '#55DFFF',
          500: '#1DD4FF',
          600: '#00B8E4',
          700: '#008BAB',
          800: '#005E73',
          900: '#00303B',
          950: '#00191F',
        },
        classicBlue: {
          50: '#B8DDFF',
          100: '#A3D3FF',
          200: '#7AC0FF',
          300: '#52ACFF',
          400: '#2999FF',
          500: '#0085FF', // default
          600: '#0068C7',
          700: '#004A8F',
          800: '#002D57',
          900: '#00101F',
          950: '#000103',
        },
        coldYellow: {
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FCFDE7',
          300: '#F6FBC1',
          400: '#F1F89B',
          500: '#ECF575', // default
          600: '#E5F141',
          700: '#DAE911',
          800: '#A9B50D',
          900: '#788009',
          950: '#5F6607',
        },
        offsetYellow: {
          50: '#FFF8E5',
          100: '#FFF3D0',
          200: '#FFE8A8',
          300: '#FEDD7F',
          400: '#FED357',
          500: '#FEC82E', // default
          600: '#F3B401',
          700: '#BB8B01',
          800: '#836101',
          900: '#4B3800',
          950: '#2F2300',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
