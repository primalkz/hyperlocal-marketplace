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
    <div className="py-12">
      <h1 className="text-4xl font-bold tracking-tight">local grocery, <span className="text-emerald-600">nearby</span></h1>
      <p className="mt-3 max-w-md text-gray-600">vendors run their own catalogue, customers find shops close by and place orders.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/login" className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">login</Link>
        <Link href="/register" className="rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-100">register</Link>
      </div>
    </div>
  )
}
