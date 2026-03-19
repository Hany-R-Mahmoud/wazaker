module.exports = {
  preset: 'jest-expo',
  watchman: false,
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/test/**/*.test.ts', '<rootDir>/src/test/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-navigation|@unimodules/.*|unimodules|@?react-native-community/.*)',
  ],
};
