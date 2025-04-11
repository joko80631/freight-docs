import { renderHook } from '@testing-library/react';
import { usePermissions, PERMISSIONS } from '../usePermissions';
import { useAuth } from '../useAuth';

// Mock useAuth hook
jest.mock('../useAuth');

describe('usePermissions', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false for all permissions when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.canReclassify).toBe(false);
    expect(result.current.canManageTeams).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.canUpdateSettings).toBe(false);
  });

  it('should return correct permissions for admin role', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' } });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.canReclassify).toBe(true);
    expect(result.current.canManageTeams).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
    expect(result.current.canUpdateSettings).toBe(true);
  });

  it('should return correct permissions for manager role', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'manager' } });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.canReclassify).toBe(true);
    expect(result.current.canManageTeams).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.canUpdateSettings).toBe(false);
  });

  it('should return correct permissions for member role', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'member' } });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.canReclassify).toBe(false);
    expect(result.current.canManageTeams).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.canUpdateSettings).toBe(false);
  });

  it('should check individual permissions correctly', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'manager' } });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission(PERMISSIONS.RECLASSIFY_ITEMS)).toBe(true);
    expect(result.current.hasPermission(PERMISSIONS.MANAGE_TEAMS)).toBe(false);
  });

  it('should check multiple permissions correctly', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'manager' } });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasAnyPermission([
      PERMISSIONS.RECLASSIFY_ITEMS,
      PERMISSIONS.MANAGE_TEAMS
    ])).toBe(true);

    expect(result.current.hasAllPermissions([
      PERMISSIONS.RECLASSIFY_ITEMS,
      PERMISSIONS.MANAGE_TEAMS
    ])).toBe(false);
  });
}); 