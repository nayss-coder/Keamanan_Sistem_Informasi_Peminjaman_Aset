'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ClipboardList, Users,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { cn, ROLE_LABEL } from '@/lib/utils'
import { Role } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: Role[]
}

const NAV: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roles: ['mahasiswa','asisten_lab','laboran','dosen_pj','admin'] },
  { href: '/peralatan',    label: 'Peralatan',    icon: Package,         roles: ['mahasiswa','asisten_lab','laboran','dosen_pj','admin'] },
  { href: '/peminjaman',   label: 'Peminjaman',   icon: ClipboardList,   roles: ['mahasiswa','asisten_lab','laboran','dosen_pj','admin'] },
  { href: '/admin',        label: 'Manajemen',    icon: Users,           roles: ['admin'] },
]

export default function Sidebar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const [open, setOpen] = useState(false)

  let user = { name: 'Pengguna', role: 'mahasiswa' as Role }
  if (typeof window !== 'undefined') {
    try { user = JSON.parse(localStorage.getItem('user') || '{}') } catch {}
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.clear()
    router.push('/login')
  }

  const visibleNav = NAV.filter(n => n.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: '#0D1425' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="SIALAT Logo" className="h-20 w-auto object-contain" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Menu</p>
        {visibleNav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              className={cn('nav-item', active && 'active')}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
             style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <p className="text-gray-500 text-xs truncate">{ROLE_LABEL[user.role] || user.role}</p>
          </div>
          <button onClick={logout} title="Logout"
            className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-8 h-8 rounded-lg bg-[#0D1425] text-white flex items-center justify-center shadow-lg">
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}

      {/* Mobile sidebar */}
      <div className={cn(
        'lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0">
        <SidebarContent />
      </div>
    </>
  )
}
