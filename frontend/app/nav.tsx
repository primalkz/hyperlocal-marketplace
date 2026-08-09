'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { api } from './lib'

export default function Nav() {
  const [role, setRole] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    api('/auth/me')
      .then((d) => setRole(d.user?.role ?? null))
      .catch(() => setRole(null))
      .finally(() => setLoaded(true))
  }, [path])

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }) } catch {}
    setRole(null)
    router.push('/')
    router.refresh()
  }

  const link = (href: string, label: string) => {
    const active = path === href
    return (
      <Link href={href} className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${active ? 'font-medium text-emerald-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>{label}</Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-4 font-semibold text-gray-900">hyperlocal</Link>
        <div className="flex items-center gap-0.5">
          {loaded && role === 'CUSTOMER' && <>{link('/shops', 'shops')}{link('/cart', 'cart')}{link('/orders', 'orders')}</>}
          {loaded && role === 'VENDOR' && link('/vendor', 'my shop')}
          {loaded && role === 'ADMIN' && link('/admin', 'admin')}
        </div>
        <div className="ml-auto">
          {!loaded ? <div className="h-8 w-16 animate-pulse rounded-md bg-gray-200" /> : role ? (
            <button onClick={logout} className="rounded-md px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">logout</button>
          ) : <div className="flex items-center gap-0.5">{link('/login', 'login')}{link('/register', 'register')}</div>}
        </div>
      </nav>
    </header>
  )
}
