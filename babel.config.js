module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // "babel-plugin-tsconfig-paths",
      'expo-router/babel',
      'nativewind/babel',
    ],
  };
};
