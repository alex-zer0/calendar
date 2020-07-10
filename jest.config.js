module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/environments/'
  ],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig-jest.json'
    }
  }
};
