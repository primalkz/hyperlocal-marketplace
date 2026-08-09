'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib'
import type { Product } from '../lib'

type Shop = { id: string; name: string; latitude: number; longitude: number; status: string } | null

export default function Vendor() {
  const [shop, setShop] = useState<Shop>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [err, setErr] = useState('')

  const [ptitle, setPtitle] = useState('')
  const [pimg, setPimg] = useState('')
  const [pprice, setPprice] = useState('')
  const [pavail, setPavail] = useState(true)
  const [editId, setEditId] = useState('')

  async function load() {
    const s = (await api('/vendor/shop')).shop as Shop
    setShop(s)
    if (s) { setName(s.name); setLat(String(s.latitude)); setLng(String(s.longitude)) }
    setProducts((await api('/vendor/products')).products ?? [])
  }
  useEffect(() => { load().catch((e) => setErr((e as Error).message)) }, [])

  async function saveShop(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const body = JSON.stringify({ name, latitude: Number(lat), longitude: Number(lng) })
    try {
      if (shop) await api('/vendor/shop', { method: 'PATCH', body })
      else await api('/vendor/shop', { method: 'POST', body })
      load()
    } catch (e) { setErr((e as Error).message) }
  }

  function edit(p: Product) {
    setPtitle(p.title); setPimg(p.image); setPprice(String(p.price)); setPavail(p.available); setEditId(p.id)
  }
  function reset() { setPtitle(''); setPimg(''); setPprice(''); setPavail(true); setEditId('') }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const body = JSON.stringify({ title: ptitle, image: pimg, price: Number(pprice), available: pavail })
    try {
      if (editId) await api(`/vendor/products/${editId}`, { method: 'PATCH', body })
      else await api('/vendor/products', { method: 'POST', body })
      reset(); load()
    } catch (e) { setErr((e as Error).message) }
  }

  async function del(id: string) {
    if (!confirm('delete this product?')) return
    await api(`/vendor/products/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">my shop</h1>
        {shop && shop.status !== 'APPROVED' && <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700">status: {shop.status.toLowerCase()}</span>}
        {err && <div className="error-box mt-3">{err}</div>}
        <form onSubmit={saveShop} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input className="input" placeholder="shop name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
          <input className="input" placeholder="longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
          <button className="btn-primary col-span-1 sm:col-span-3">{shop ? 'update shop' : 'create shop'}</button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold">products</h2>
        <form onSubmit={saveProduct} className="mt-4 space-y-3">
          <input className="input" placeholder="product title" value={ptitle} onChange={(e) => setPtitle(e.target.value)} />
          <input className="input" placeholder="image url" value={pimg} onChange={(e) => setPimg(e.target.value)} />
          <div className="flex gap-3">
            <input className="input" placeholder="price" type="number" step="0.01" value={pprice} onChange={(e) => setPprice(e.target.value)} />
            <label className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-700"><input type="checkbox" checked={pavail} onChange={(e) => setPavail(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600" /> available</label>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">{editId ? 'update' : 'add'} product</button>
            {editId && <button type="button" onClick={reset} className="btn-secondary">cancel</button>}
          </div>
        </form>

        <div className="mt-4 space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" />
              <div className="flex-1">
                <div className="text-sm font-medium">{p.title} {!p.available && <span className="text-xs text-gray-400">(unavailable)</span>}</div>
                <div className="text-sm text-gray-500">₹{p.price}</div>
              </div>
              <button onClick={() => edit(p)} className="text-sm text-emerald-600 hover:text-emerald-700">edit</button>
              <button onClick={() => del(p.id)} className="text-sm text-red-500 hover:text-red-700">delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
