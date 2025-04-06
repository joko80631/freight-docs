"use client";

import { WithTeamProtection } from "@/components/with-team-protection";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <WithTeamProtection>{children}</WithTeamProtection>;
} 