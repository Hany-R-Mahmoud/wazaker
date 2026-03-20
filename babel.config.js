module.exports = function (api) {
  api.cache(true);
  // Expo is resolved from the installed package location to avoid preset lookup drift.
  const expoPreset = require.resolve('babel-preset-expo', {
    paths: [require.resolve('expo/package.json')],
  });

  return {
    presets: [expoPreset],
  };
};
