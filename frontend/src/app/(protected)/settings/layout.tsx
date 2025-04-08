"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, User, Shield, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const tabs = [
    {
      name: "Profile",
      href: "/settings/profile",
      icon: User,
    },
    {
      name: "Notifications",
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      name: "Security",
      href: "/settings/security",
      icon: Shield,
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-5xl">
          {/* Header Section */}
          <section className="mb-6">
            <h1 className="text-xl font-semibold md:text-2xl">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </section>

          {/* Search and Tabs Section */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search settings..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto pb-2 sm:pb-0">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href
                return (
                  <Button
                    key={tab.name}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center gap-2 rounded-none border-b-2 px-4 py-2",
                      isActive
                        ? "border-primary font-medium"
                        : "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => router.push(tab.href)}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="rounded-lg border bg-card shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 