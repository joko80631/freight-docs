import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { createMockSupabase, resetSupabaseInstance } from './utils/supabase-test-utils';
import './mocks/next-router';
import React from 'react';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => createMockSupabase(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useMediaQuery hook
jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    resetSupabaseInstance();
    localStorageMock.clear();
  });

  const setMobileView = () => {
    const { useMediaQuery } = require('@/hooks/use-media-query');
    useMediaQuery.mockReturnValue(true);
  };

  const setDesktopView = () => {
    const { useMediaQuery } = require('@/hooks/use-media-query');
    useMediaQuery.mockReturnValue(false);
  };

  const waitForMounted = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  };

  it('renders without crashing', async () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    await waitForMounted();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders sidebar collapsed by default', async () => {
    // Set initial state in localStorage
    localStorageMock.setItem('sidebar-collapsed', 'true');

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    await waitForMounted();
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('w-16');
  });

  it('toggles sidebar when toggle button is clicked', async () => {
    // Set initial state in localStorage
    localStorageMock.setItem('sidebar-collapsed', 'true');

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    await waitForMounted();
    const toggleButton = screen.getByTestId('sidebar-toggle');
    expect(toggleButton).toBeInTheDocument();

    // Click to expand
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('w-64');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'false');
    });

    // Click to collapse
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('w-16');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });
  });

  it('renders mobile overlay when sidebar is expanded on mobile', async () => {
    setMobileView();
    // Set initial state in localStorage
    localStorageMock.setItem('sidebar-collapsed', 'false');

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    await waitForMounted();
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('w-64');
    const overlay = screen.getByTestId('mobile-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('closes sidebar when overlay is clicked on mobile', async () => {
    setMobileView();
    // Set initial state in localStorage
    localStorageMock.setItem('sidebar-collapsed', 'false');

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    await waitForMounted();
    const overlay = screen.getByTestId('mobile-overlay');
    expect(overlay).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(overlay);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });
  });

  it('closes sidebar when Escape key is pressed on mobile', async () => {
    setMobileView();
    // Set initial state in localStorage
    localStorageMock.setItem('sidebar-collapsed', 'false');

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    await waitForMounted();
    const overlay = screen.getByTestId('mobile-overlay');
    expect(overlay).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
    });
  });
}); 