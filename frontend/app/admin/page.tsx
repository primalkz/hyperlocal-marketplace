'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib'

type Vendor = {
  id: string
  email: string
  createdAt: string
  shop: { id: string; name: string; status: string } | null
}

type AdminOrder = {
  id: string
  customer: string
  shop: string
  total: number
  status: string
  createdAt: string
  items: { title: string; quantity: number; price: number }[]
}

const statusStyles: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
  DISABLED: 'bg-gray-200 text-gray-600',
}

export default function Admin() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const v = await api('/admin/vendors')
      setVendors(v.vendors ?? [])
      const o = await api('/admin/orders')
      setOrders(o.orders ?? [])
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  useEffect(() => { load() }, [])

  async function setStatus(id: string, status: string) {
    setErr('')
    try {
      await api(`/admin/vendors/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      load()
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">vendors</h1>
        {err && <div className="error-box mt-3">{err}</div>}
        <div className="mt-4 space-y-3">
          {vendors.map((v) => (
            <div key={v.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{v.email}</div>
                <div className="text-sm text-gray-500">{v.shop?.name ?? 'no shop yet'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[v.shop?.status ?? 'PENDING'] ?? statusStyles.PENDING}`}>{(v.shop?.status ?? 'pending').toLowerCase()}</span>
                <button onClick={() => setStatus(v.id, 'APPROVED')} className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700">approve</button>
                <button onClick={() => setStatus(v.id, 'REJECTED')} className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">reject</button>
                <button onClick={() => setStatus(v.id, 'DISABLED')} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">disable</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">orders</h2>
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">{o.customer} · {o.shop}</span>
                <span className="font-semibold">₹{o.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-1 text-gray-400">{new Date(o.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
