module.exports = function (api) {
  api.cache(true);
  const expoPreset = require.resolve('babel-preset-expo', {
    paths: [require.resolve('expo/package.json')],
  });

  return {
    presets: [expoPreset],
  };
};
