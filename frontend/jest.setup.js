require('dotenv').config({ path: '.env.test' });

// Mock fetch globally
global.fetch = jest.fn(() => 
  Promise.resolve({
    status: 302,
    json: () => Promise.resolve({}),
  })
);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 