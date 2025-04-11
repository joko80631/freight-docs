import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'node:util'

global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}))

// Mock team store
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

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 