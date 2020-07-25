module.exports = {
  purge: ['./src/**/*.ejs'],
  theme: {
    fontFamily: {
      sans: [
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
        'sans-serif',
      ],
      serif: ['Martel', 'serif'],
    },
    container: {
      center: true,
      padding: {
        default: '1rem',
      },
    },
  },
  variants: {},
  plugins: [],
};
