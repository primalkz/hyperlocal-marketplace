'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '../../lib'
import type { Product } from '../../lib'

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-gray-200 p-3">
            <div className="h-32 w-full animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

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

  if (!shop && !err) return <Skeleton />
  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{shop?.name ?? 'shop'}</h1>
      {err && <div className="error-box">{err}</div>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-card-hover hover:border-gray-300">
            <img src={p.image} alt={p.title} className="mb-3 h-32 w-full rounded-md object-cover" />
            <div className="text-sm font-medium leading-snug">{p.title}</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">₹{p.price}</div>
            <button onClick={() => add(p)} disabled={!p.available} className="btn-primary mt-3 w-full text-xs py-2">
              {p.available ? 'add to cart' : 'unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
