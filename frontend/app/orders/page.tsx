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
    <div className="space-y-4">
      <h1 className="text-xl font-bold">your orders</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {orders.length === 0 && !err && <p className="text-gray-600">no orders yet.</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded border p-3">
            <div className="flex justify-between">
              <span className="font-medium">₹{o.total} · {o.status}</span>
              <span className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</span>
            </div>
            <ul className="mt-1 text-sm text-gray-700">
              {o.items.map((i, idx) => (
                <li key={idx}>{i.quantity} × {i.title} — ₹{i.price}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
