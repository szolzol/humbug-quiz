export default {
  plugins: {
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
        "custom-properties": true,
        "color-function": true,
        "oklab-function": {
          preserve: true, // Keep modern OKLCH/OKLAB but add fallbacks
        },
      },
      browsers:
        "last 2 versions, > 1%, not dead, Chrome >= 87, Safari >= 14, Firefox >= 78, Edge >= 88",
    },
  },
};
