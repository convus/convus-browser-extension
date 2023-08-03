/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node'
}

// module.exports = {
//   verbose: false,
//   transformIgnorePatterns: ['<rootDir>/node_modules/'],
//   moduleFileExtensions: ['ts'],
//   testMatch: [
//     '<rootDir>/(tests/**/*.test.(ts)|**/__tests__/*.(ts))'
//   ],
//   testEnvironment: 'jsdom',
//   transform: {
//     '^.+\\.ts$': 'babel-jest'
//   },
//   automock: false,
//   setupFiles: ['./setupJest.js']
// }
