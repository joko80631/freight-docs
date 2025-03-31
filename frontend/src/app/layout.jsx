import { Inter } from "next/font/google";
import "./globals.css";
import { TeamSelector } from "@/components/TeamSelector";
import { RequireTeam } from "@/components/RequireTeam";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Freight Management System",
  description: "Manage your freight operations efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Freight Management
                </h1>
                <TeamSelector />
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <RequireTeam>
              {children}
            </RequireTeam>
          </main>
        </div>
      </body>
    </html>
  );
} 