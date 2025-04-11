import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthContext } from '../../providers/auth-provider';
import { createClient } from '@supabase/supabase-js';
import React from 'react';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }))
}));

// Mock React.useContext
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}));

describe('useAuth', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    role: 'admin'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use auth context when available', () => {
    const mockContext = {
      user: mockUser,
      isLoading: false,
      error: null,
      isAuthenticated: true,
      signIn: jest.fn(),
      signOut: jest.fn()
    };

    (React.useContext as jest.Mock).mockReturnValue(mockContext);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should use Supabase when context is not available', async () => {
    const mockSession = { user: mockUser };
    const mockSupabase = createClient('', '');
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    (React.useContext as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();

    // Wait for session to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle auth errors', async () => {
    const mockError = new Error('Auth error');
    const mockSupabase = createClient('', '');
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: mockError
    });

    (React.useContext as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    // Wait for error to be set
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should throw error when used outside of AuthProvider', () => {
    (React.useContext as jest.Mock).mockReturnValue(null);

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
}); 