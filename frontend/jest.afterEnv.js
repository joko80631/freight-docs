// This file runs after the test environment is set up
beforeEach(() => {
  jest.clearAllMocks();
});

// Add any global test setup here
afterAll(() => {
  // Clean up any global resources
  jest.resetAllMocks();
}); 