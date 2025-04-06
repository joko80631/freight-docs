// This file sets up the testing environment
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js router
import './mocks/next-router';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web Fetch API
class Request {
  constructor(input: string | Request, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
  }
  url: string;
  method: string;
  headers: Headers;
  body: any;
}

class Headers {
  private headers: { [key: string]: string } = {};
  
  constructor(init?: any) {
    if (!init) return;
    
    if (init instanceof Headers) {
      this.headers = { ...init };
      return;
    }
    
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          this.headers[key.toLowerCase()] = value;
        }
      });
      return;
    }
    
    if (typeof init === 'object') {
      Object.entries(init).forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          this.headers[key.toLowerCase()] = value;
        }
      });
    }
  }

  append(name: string, value: string): void {
    this.headers[name.toLowerCase()] = value;
  }

  get(name: string): string | null {
    return this.headers[name.toLowerCase()] || null;
  }

  has(name: string): boolean {
    return name.toLowerCase() in this.headers;
  }

  set(name: string, value: string): void {
    this.headers[name.toLowerCase()] = value;
  }

  delete(name: string): void {
    delete this.headers[name.toLowerCase()];
  }
}

class Response {
  body: any;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  type: ResponseType;
  url: string;

  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || '';
    this.headers = new Headers(init?.headers);
    this.ok = this.status >= 200 && this.status < 300;
    this.redirected = false;
    this.type = 'default';
    this.url = '';
  }
}

global.Request = Request as any;
global.Headers = Headers as any;
global.Response = Response as any;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 