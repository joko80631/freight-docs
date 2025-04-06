import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardLayout } from '../dashboard-layout';
import { useMediaQuery } from '@/hooks/use-media-query';

// Mock the useMediaQuery hook
jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false),
}));

// Mock the useLocalStorage hook
jest.mock('@/lib/useLocalStorage', () => ({
  useLocalStorage: jest.fn().mockImplementation((key, initialValue) => {
    return [initialValue, jest.fn()];
  }),
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('renders sidebar collapsed by default', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('w-16');
  });

  it('toggles sidebar when toggle button is clicked', () => {
    const mockSetSidebarCollapsed = jest.fn();
    jest.spyOn(require('@/lib/useLocalStorage'), 'useLocalStorage')
      .mockImplementation((key, initialValue) => {
        return [false, mockSetSidebarCollapsed];
      });

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    const toggleButton = screen.getByTestId('sidebar-toggle');
    fireEvent.click(toggleButton);
    
    expect(mockSetSidebarCollapsed).toHaveBeenCalledWith(true);
  });

  it('renders mobile overlay when sidebar is expanded on mobile', () => {
    // Mock mobile view
    jest.spyOn(require('@/hooks/use-media-query'), 'useMediaQuery')
      .mockReturnValue(true);
    
    // Mock sidebar expanded
    jest.spyOn(require('@/lib/useLocalStorage'), 'useLocalStorage')
      .mockImplementation((key, initialValue) => {
        return [false, jest.fn()];
      });

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    expect(screen.getByTestId('mobile-overlay')).toBeInTheDocument();
  });

  it('does not render mobile overlay when sidebar is collapsed on mobile', () => {
    // Mock mobile view
    jest.spyOn(require('@/hooks/use-media-query'), 'useMediaQuery')
      .mockReturnValue(true);
    
    // Mock sidebar collapsed
    jest.spyOn(require('@/lib/useLocalStorage'), 'useLocalStorage')
      .mockImplementation((key, initialValue) => {
        return [true, jest.fn()];
      });

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
  });

  it('closes sidebar when overlay is clicked on mobile', () => {
    // Mock mobile view
    jest.spyOn(require('@/hooks/use-media-query'), 'useMediaQuery')
      .mockReturnValue(true);
    
    const mockSetSidebarCollapsed = jest.fn();
    jest.spyOn(require('@/lib/useLocalStorage'), 'useLocalStorage')
      .mockImplementation((key, initialValue) => {
        return [false, mockSetSidebarCollapsed];
      });

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    const overlay = screen.getByTestId('mobile-overlay');
    fireEvent.click(overlay);
    
    expect(mockSetSidebarCollapsed).toHaveBeenCalledWith(true);
  });

  it('closes sidebar when Escape key is pressed on mobile', () => {
    // Mock mobile view
    jest.spyOn(require('@/hooks/use-media-query'), 'useMediaQuery')
      .mockReturnValue(true);
    
    const mockSetSidebarCollapsed = jest.fn();
    jest.spyOn(require('@/lib/useLocalStorage'), 'useLocalStorage')
      .mockImplementation((key, initialValue) => {
        return [false, mockSetSidebarCollapsed];
      });

    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    
    // Simulate Escape key press
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockSetSidebarCollapsed).toHaveBeenCalledWith(true);
  });
}); 