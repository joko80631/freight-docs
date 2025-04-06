import { useRouter, usePathname, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Add a test to satisfy Jest's requirement
describe('Next.js Router Mock', () => {
  test('useRouter returns a mock router', () => {
    const router = useRouter();
    expect(router).toBeDefined();
    expect(router.push).toBeDefined();
    expect(router.replace).toBeDefined();
    expect(router.back).toBeDefined();
    expect(router.forward).toBeDefined();
    expect(router.refresh).toBeDefined();
    expect(router.prefetch).toBeDefined();
  });
}); 