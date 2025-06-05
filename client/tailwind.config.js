module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fusion': { 
          '50': '#f2f7fd',
          '100': '#e5eef9',
          '200': '#c5dcf2',
          '300': '#91bfe8',
          '400': '#569dda',
          '500': '#2f7dc0',
          '600': '#2166a8',
          '700': '#1c5288',
          '800': '#1b4671',
          '900': '#1b3c5f',
        },    
        'portal': { 
          '50': '#f1fcfa',
          '100': '#d0f7f1',
          '200': '#a1eee3',
          '300': '#6aded1',
          '400': '#3ec7bc',
          '500': '#22aaa1',
          '600': '#188984',
          '700': '#186d6b',
          '800': '#175856',
          '900': '#184948',
        },
      },
      keyframes: {
        wiggle: {
            '0%': {
                transform: 'rotate(0deg)'
            },
            '60%': {
              transform: 'rotate(45deg)'
            },
            '100%': {
                transform: 'rotate(45deg) scale(1.1)'
            },
        },
        no: {
            '0%': {
                transform: 'translateX(-5px)'
            },
            '100%': {
                transform: 'translateX(5px)'
            }
        }
      },
      animation: {
          wiggle: 'wiggle 1.3s ease-in-out infinite alternate',
          no: 'no 100ms ease-in-out 3 alternate',
      }
    },
  },
  plugins: [],
}
