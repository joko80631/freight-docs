require('dotenv').config({ path: '.env.test' });

// Mock fetch globally
global.fetch = jest.fn(() => 
  Promise.resolve({
    status: 302,
    json: () => Promise.resolve({}),
  })
); 