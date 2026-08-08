'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib'
import type { Product } from '../lib'

type Shop = { id: string; name: string; latitude: number; longitude: number; status: string } | null

const input = 'w-full rounded border p-2'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">my shop</h1>
        {shop && shop.status !== 'APPROVED' && <p className="text-sm text-amber-700">status: {shop.status}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <form onSubmit={saveShop} className="mt-2 grid grid-cols-3 gap-2">
          <input className={input} placeholder="shop name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={input} placeholder="lat" value={lat} onChange={(e) => setLat(e.target.value)} />
          <input className={input} placeholder="lng" value={lng} onChange={(e) => setLng(e.target.value)} />
          <button className="col-span-3 rounded bg-black p-2 text-white">{shop ? 'update shop' : 'create shop'}</button>
        </form>
      </div>

      <div>
        <h2 className="font-bold">products</h2>
        <form onSubmit={saveProduct} className="mt-2 space-y-2">
          <input className={input} placeholder="title" value={ptitle} onChange={(e) => setPtitle(e.target.value)} />
          <input className={input} placeholder="image url" value={pimg} onChange={(e) => setPimg(e.target.value)} />
          <div className="flex gap-2">
            <input className={input} placeholder="price" type="number" step="0.01" value={pprice} onChange={(e) => setPprice(e.target.value)} />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={pavail} onChange={(e) => setPavail(e.target.checked)} /> available</label>
          </div>
          <div className="flex gap-2">
            <button className="rounded bg-black p-2 text-white">{editId ? 'update' : 'add'} product</button>
            {editId && <button type="button" onClick={reset} className="rounded border p-2">cancel</button>}
          </div>
        </form>

        <ul className="mt-3 divide-y">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2">
              <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
              <div className="flex-1">
                <div className="font-medium">{p.title} {p.available ? '' : <span className="text-xs text-gray-500">(unavailable)</span>}</div>
                <div className="text-sm text-gray-600">₹{p.price}</div>
              </div>
              <button onClick={() => edit(p)} className="text-sm underline">edit</button>
              <button onClick={() => del(p.id)} className="text-sm text-red-600 underline">delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
