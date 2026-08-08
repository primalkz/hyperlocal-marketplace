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

const btn = 'rounded border px-2 py-0.5 text-sm'

export default function Admin() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const v = await api('/admin/vendor')
      setVendors(v.vendors ?? [])
      const o = await api('/admin/orders')
      setOrders(o.orders ?? [])
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  useEffect(() => {
    load()
  }, [])

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">vendors</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <ul className="mt-2 divide-y">
          {vendors.map((v) => (
            <li key={v.id} className="py-2">
              <div className="flex justify-between">
                <span className="font-medium">{v.email}</span>
                <span className="text-sm text-gray-500">{v.shop?.status ?? 'no shop'}</span>
              </div>
              <div className="text-sm text-gray-600">{v.shop?.name}</div>
              <div className="mt-1 flex gap-2">
                <button className={btn} onClick={() => setStatus(v.id, 'APPROVED')}>approve</button>
                <button className={btn} onClick={() => setStatus(v.id, 'REJECTED')}>reject</button>
                <button className={btn} onClick={() => setStatus(v.id, 'DISABLED')}>disable</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold">orders</h2>
        <ul className="mt-2 space-y-2">
          {orders.map((o) => (
            <li key={o.id} className="rounded border p-2 text-sm">
              <div className="flex justify-between">
                <span>{o.customer} · {o.shop}</span>
                <span>₹{o.total}</span>
              </div>
              <div className="text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
