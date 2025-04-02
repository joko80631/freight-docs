'use client';

import { layout } from "@/lib/layout";
import { responsive } from "@/lib/responsive";

export function AuthLayout({ children }) {
  return (
    <div className={`${layout.page} ${responsive.container}`}>
      <header className="border-b">
        <div className={`${layout.container} py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">FreightDocs</span>
            </div>
          </div>
        </div>
      </header>

      <main className={`${layout.container} flex-1 py-8`}>
        {children}
      </main>

      <footer className="border-t">
        <div className={`${layout.container} py-4`}>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <a href="/privacy" className="hover:text-foreground">Privacy</a>
              <a href="/terms" className="hover:text-foreground">Terms</a>
            </div>
            <div>© {new Date().getFullYear()} FreightDocs. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
} 