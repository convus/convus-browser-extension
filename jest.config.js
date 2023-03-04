module.exports = {
  verbose: false,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['js'],
  testMatch: [
    '<rootDir>/(tests/**/*.test.(js)|**/__tests__/*.(js))'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}
