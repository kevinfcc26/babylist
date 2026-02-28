import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        {children}
      </div>
    </div>
  )
}
