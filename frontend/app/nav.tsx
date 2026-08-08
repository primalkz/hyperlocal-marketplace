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
    await api('/auth/logout', { method: 'POST' })
    setRole(null)
    router.push('/')
    router.refresh()
  }

  const link = (href: string, label: string) => (
    <Link href={href} className={`rounded-md px-2.5 py-1 ${path === href ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>{label}</Link>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-3 text-sm">
        <Link href="/" className="mr-2 flex items-center gap-2 font-bold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          hyperlocal
        </Link>
        {loaded && role === 'CUSTOMER' && <>{link('/shops', 'shops')}{link('/cart', 'cart')}{link('/orders', 'orders')}</>}
        {loaded && role === 'VENDOR' && link('/vendor', 'my shop')}
        {loaded && role === 'ADMIN' && link('/admin', 'admin')}
        <div className="ml-auto">
          {!loaded ? null : role ? (
            <button onClick={logout} className="rounded-md px-2.5 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900">logout</button>
          ) : (
            <>{link('/login', 'login')}{link('/register', 'register')}</>
          )}
        </div>
      </nav>
    </header>
  )
}
