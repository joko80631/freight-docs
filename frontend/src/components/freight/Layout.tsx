import { cn } from "@/lib/utils"
import { createContext, useContext, useState } from "react"

interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  scrollY: number
  setScrollY: (y: number) => void
  pageTitle: string
  setPageTitle: (title: string) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function useLayoutContext() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayoutContext must be used within a LayoutProvider")
  }
  return context
}

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [pageTitle, setPageTitle] = useState("")

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        scrollY,
        setScrollY,
        pageTitle,
        setPageTitle,
      }}
    >
      <div className={cn("min-h-screen bg-neutral-50 dark:bg-neutral-950", className)}>
        {children}
      </div>
    </LayoutContext.Provider>
  )
}

interface LayoutHeaderProps {
  children: React.ReactNode
  className?: string
  sticky?: boolean
}

Layout.Header = function LayoutHeader({
  children,
  className,
  sticky = true,
}: LayoutHeaderProps) {
  const { scrollY } = useLayoutContext()

  return (
    <header
      className={cn(
        "w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800",
        sticky && "sticky top-0 z-50",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </header>
  )
}

interface LayoutContentProps {
  children: React.ReactNode
  className?: string
}

Layout.Content = function LayoutContent({ children, className }: LayoutContentProps) {
  return (
    <main className={cn("flex-1 py-6", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </main>
  )
}

interface LayoutSidebarProps {
  children: React.ReactNode
  className?: string
}

Layout.Sidebar = function LayoutSidebar({ children, className }: LayoutSidebarProps) {
  const { sidebarOpen } = useLayoutContext()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {children}
    </aside>
  )
}

interface LayoutFooterProps {
  children: React.ReactNode
  className?: string
}

Layout.Footer = function LayoutFooter({ children, className }: LayoutFooterProps) {
  return (
    <footer
      className={cn(
        "w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
    </footer>
  )
} 