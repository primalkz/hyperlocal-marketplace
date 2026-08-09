'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib'

type Order = {
  id: string
  shopId: string
  total: number
  status: string
  createdAt: string
  items: { title: string; quantity: number; price: number }[]
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    api('/orders')
      .then((d) => setOrders(d.orders ?? []))
      .catch((e) => setErr((e as Error).message))
  }, [])

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">your orders</h1>
      {err && <div className="error-box">{err}</div>}
      {orders.length === 0 && !err && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">no orders yet</p>
        </div>
      )}
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">₹{o.total.toLocaleString('en-IN')}</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{o.status.toLowerCase()}</span>
            </div>
            <div className="mt-1 text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</div>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              {o.items.map((i, idx) => (
                <li key={idx}>{i.quantity} × {i.title}, ₹{i.price}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
