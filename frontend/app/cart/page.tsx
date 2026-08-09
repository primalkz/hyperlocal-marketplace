'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    if (q < 0) return
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
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">your cart</h1>
      {err && <div className="error-box">{err}</div>}
      {!cart || cart.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">cart is empty</p>
          <Link href="/shops" className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">browse shops →</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cart.items.map((i) => (
              <CartItemRow key={i.id} item={i} onSet={setQty} onRemove={remove} />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-lg font-semibold">total ₹{total.toLocaleString('en-IN')}</span>
            <button onClick={checkout} className="btn-primary">place order</button>
          </div>
        </>
      )}
    </div>
  )
}

function CartItemRow({ item, onSet, onRemove }: { item: Item; onSet: (item: Item, q: number) => void; onRemove: (item: Item) => void }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
      <img src={item.product.image} alt="" className="h-12 w-12 rounded-md object-cover" />
      <div className="flex-1">
        <div className="text-sm font-medium">{item.product.title}</div>
        <div className="text-sm text-gray-500">₹{item.product.price}</div>
      </div>
      <div className="flex items-center rounded-lg border border-gray-300">
        <button onClick={() => onSet(item, item.quantity - 1)} className="px-3 py-1.5 text-gray-500 transition-colors hover:text-gray-900">−</button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button onClick={() => onSet(item, item.quantity + 1)} className="px-3 py-1.5 text-gray-500 transition-colors hover:text-gray-900">+</button>
      </div>
      <button onClick={() => onRemove(item)} className="text-sm text-red-500 transition-colors hover:text-red-700">remove</button>
    </div>
  )
}
