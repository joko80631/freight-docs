const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest']
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase|@radix-ui|@floating-ui|cmdk|openai)/)'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironmentOptions: {
    customExportConditions: ['']
  }
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig); 