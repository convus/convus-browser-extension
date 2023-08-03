module.exports = {
  verbose: false,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['js', 'ts'],
  testMatch: [
    '<rootDir>/(tests/**/*.test.(js)|**/__tests__/*.(js))'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.t|js$': 'babel-jest'
  },
  automock: false,
  setupFiles: ['./setupJest.js']
}
