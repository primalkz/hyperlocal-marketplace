'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from './lib'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    api('/auth/me').then((d) => {
      const r = d.user?.role
      if (r === 'CUSTOMER') router.replace('/shops')
      else if (r === 'VENDOR') router.replace('/vendor')
      else if (r === 'ADMIN') router.replace('/admin')
    }).catch(() => {})
  }, [router])

  return (
    <div className="animate-fade-in-up py-16 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">local grocery, <span className="text-emerald-600">nearby</span></h1>
      <p className="mx-auto mt-4 max-w-md text-gray-500">vendors run their own catalogue, customers find shops close by and place orders.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/login" className="btn-primary">login</Link>
        <Link href="/register" className="btn-secondary">register</Link>
      </div>
    </div>
  )
}
