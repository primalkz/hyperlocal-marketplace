'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '../../lib'
import type { Product } from '../../lib'

export default function ShopProducts() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [shop, setShop] = useState<{ id: string; name: string } | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    api(`/shops/${id}`).then((d) => setShop(d.shop)).catch((e) => setErr((e as Error).message))
    api(`/shops/${id}/products`).then((d) => setProducts(d.products ?? [])).catch((e) => setErr((e as Error).message))
  }, [id])

  async function add(p: Product) {
    setErr('')
    try {
      await api('/cart/items', { method: 'POST', body: JSON.stringify({ productId: p.id, quantity: 1 }) })
      router.push('/cart')
    } catch (e) { setErr((e as Error).message) }
  }

  if (!shop && !err) return <p>loading...</p>
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{shop?.name ?? 'shop'}</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <li key={p.id} className="rounded border p-3">
            <img src={p.image} alt="" className="mb-2 h-24 w-full rounded object-cover" />
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-600">₹{p.price}</div>
            <button onClick={() => add(p)} disabled={!p.available} className="mt-2 w-full rounded bg-black p-1.5 text-sm text-white disabled:opacity-40">
              {p.available ? 'add to cart' : 'unavailable'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
