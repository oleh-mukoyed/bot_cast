/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d4cfff',
          300: '#b6a8ff',
          400: '#9378ff',
          500: '#7341ff',
          600: '#631bff',
          700: '#570df8',
          800: '#4607d0',
          900: '#3b08aa',
          950: '#210174'
        },
        secondary: '#f000b8',
        accent: '#1dcdbc',
        //neutral: '#2b3440',
        base: {
          50: '#ffffff',
          100: '#efefef',
          200: '#dcdcdc',
          300: '#bdbdbd',
          400: '#989898',
          500: '#7c7c7c',
          600: '#656565',
          700: '#525252',
          800: '#464646',
          900: '#3d3d3d',
          950: '#292929'
        },
        info: '#3abff8',
        success: '#36d399',
        warning: '#fbbd23',
        error: '#f87272',

        d_primary: {
          50: '#f4f2ff',
          100: '#ebe7ff',
          200: '#dad3ff',
          300: '#bfb0ff',
          400: '#a083ff',
          500: '#8251ff',
          600: '#732dfa',
          700: '#641ae6',
          800: '#5416c1',
          900: '#46149e',
          950: '#290a6b'
        },
        d_secondary: '#d926a9',
        d_accent: '#1fb2a6',
        d_neutral: '#2a323c',
        d_base: {
          50: '#1d232a',
          100: '#323d48',
          200: '#384654',
          300: '#405264',
          400: '#4e667b',
          500: '#637e94',
          600: '#829aae',
          700: '#aebecb',
          800: '#d4dce3',
          900: '#eceff2',
          950: '#f6f8f9'
        },
        d_info: '#3abff8',
        d_success: '#36d399',
        d_warning: '#fbbd23',
        d_error: '#f87272'
      }
    }
  },
  plugins: []
}
