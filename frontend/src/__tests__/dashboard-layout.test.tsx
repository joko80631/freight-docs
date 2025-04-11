import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

// Mock the hooks and components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/dashboard/sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}))

jest.mock('@/store/team-store', () => ({
  useTeamStore: jest.fn(() => ({
    teams: [],
    currentTeam: null,
    hasAttemptedLoad: true,
    isLoading: false,
    error: null,
    setCurrentTeam: jest.fn(),
    fetchTeams: jest.fn(),
    createTeam: jest.fn(),
    updateTeam: jest.fn(),
    deleteTeam: jest.fn(),
    reset: jest.fn(),
    fetchTeamMembers: jest.fn(),
    updateTeamMemberRole: jest.fn(),
    removeTeamMember: jest.fn(),
  })),
}))

describe('DashboardLayout', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      loading: false,
    })
  })

  it('renders children and sidebar', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('shows loading state', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })
}) 