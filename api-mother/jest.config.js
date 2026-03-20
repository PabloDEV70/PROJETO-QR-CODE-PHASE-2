module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src', // Point to src directory for unit tests
  testRegex: '.*\.spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};