module.exports = {
  verbose: false,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['js'],
  testMatch: [
    '<rootDir>/(tests/**/*.spec.(js)|**/__tests__/*.(js))'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}
