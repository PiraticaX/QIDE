'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/components/ThemeProvider'
import {
  LayoutDashboard, Code2, GitBranch, Shield, Cpu, Settings,
  HelpCircle, Bell, Search, Sun, Moon, LogOut, ChevronRight,
  Zap, Menu, X, User
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ide', icon: Code2, label: 'Quantum IDE' },
  { href: '/workflow', icon: GitBranch, label: 'Workflows' },
  { href: '/pqc', icon: Shield, label: 'PQC Migration' },
  { href: '/optimize', icon: Cpu, label: 'Optimization' },
]

const NAV_BOTTOM = [
  { href: '/help', icon: HelpCircle, label: 'Help & Support' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    router.replace('/auth')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col
        transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
            QuantumOS
          </span>
          <button className="ml-auto lg:hidden p-1 rounded-lg hover:opacity-70" onClick={() => setSidebarOpen(false)}>
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Platform
          </p>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all group ${
                  active ? 'text-white' : 'hover:opacity-80'
                }`} style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--text-secondary)',
                }}>
                  <Icon size={16} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </div>
              </Link>
            )
          })}

          <div className="mt-4 mb-1 mx-1" style={{ borderTop: '1px solid var(--border)' }} />
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: 'var(--text-muted)' }}>
            System
          </p>
          {NAV_BOTTOM.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all ${
                  active ? 'text-white' : ''
                }`} style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--text-secondary)',
                }}>
                  <Icon size={16} />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-white"
              style={{ background: 'var(--accent)' }}>
              {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.display_name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1 rounded-lg hover:opacity-70 transition-opacity">
              <LogOut size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center px-4 gap-3 shrink-0"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <button className="lg:hidden p-2 rounded-xl hover:opacity-70" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm flex-1 max-w-xs transition-all hover:opacity-80"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <Search size={14} />
            <span>Search…</span>
            <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl transition-all hover:opacity-70"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              {theme === 'light' ? <Moon size={16} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={16} style={{ color: 'var(--text-secondary)' }} />}
            </button>
            <button className="p-2 rounded-xl transition-all hover:opacity-70"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: 'var(--accent)' }}>
                {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Status bar */}
        <div className="h-7 flex items-center px-4 gap-4 text-xs shrink-0"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>All systems operational</span>
          </div>
          <span className="ml-auto">QuantumOS v1.0.0</span>
        </div>
      </div>
    </div>
  )
}
