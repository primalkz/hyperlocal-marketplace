'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib'

type Item = { id: string; productId: string; quantity: number; product: { id: string; title: string; image: string; price: number; available: boolean } }
type Cart = { id: string; shopId: string | null; items: Item[] } | null

export default function Cart() {
  const [cart, setCart] = useState<Cart>(null)
  const [err, setErr] = useState('')
  const router = useRouter()

  async function load() {
    try { setCart((await api('/cart')).cart ?? null) } catch (e) { setErr((e as Error).message) }
  }
  useEffect(() => { load() }, [])

  async function setQty(item: Item, q: number) {
    await api(`/cart/items/${item.id}`, { method: 'PATCH', body: JSON.stringify({ quantity: q }) })
    load()
  }
  async function remove(item: Item) {
    await api(`/cart/items/${item.id}`, { method: 'DELETE' })
    load()
  }
  async function checkout() {
    setErr('')
    try {
      await api('/orders', { method: 'POST', body: JSON.stringify({}) })
      router.push('/orders')
    } catch (e) { setErr((e as Error).message) }
  }

  const total = cart?.items.reduce((s, i) => s + i.product.price * i.quantity, 0) ?? 0

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">your cart</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {!cart || cart.items.length === 0 ? (
        <p className="text-gray-600">cart is empty. <a href="/shops" className="underline">browse shops</a>.</p>
      ) : (
        <>
          <ul className="divide-y">
            {cart.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2">
                <img src={i.product.image} alt="" className="h-10 w-10 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{i.product.title}</div>
                  <div className="text-sm text-gray-600">₹{i.product.price}</div>
                </div>
                <input type="number" min={0} value={i.quantity} onChange={(e) => setQty(i, Number(e.target.value))} className="w-16 rounded border p-1" />
                <button onClick={() => remove(i)} className="text-sm text-red-600 underline">remove</button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <span className="font-bold">total ₹{total}</span>
            <button onClick={checkout} className="rounded bg-black p-2 text-white">place order</button>
          </div>
        </>
      )}
    </div>
  )
}
