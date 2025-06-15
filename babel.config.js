module.exports = function (api) {
  api.cache(true);  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'expo-router/babel' removed - deprecated in Expo SDK 50+
      'react-native-reanimated/plugin',
    ],
  };
};
