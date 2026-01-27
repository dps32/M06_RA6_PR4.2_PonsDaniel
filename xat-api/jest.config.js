module.exports = {
    testEnvironment: 'node',
    verbose: true,
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    rootDir: '.'
};