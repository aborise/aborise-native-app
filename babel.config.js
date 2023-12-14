const stripTypes = require('./babel-plugin-strip-types');

module.exports = function (api) {
  api.cache(true);
  api.debug = true;
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      stripTypes,
      'expo-router/babel',
      'nativewind/babel',
      [
        'babel-plugin-show-source',
        {
          removeDirective: false,
          directive: 'use webview',
        },
      ],
    ],
  };
};
