'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '../lib'
import type { Shop } from '../lib'

export default function Shops() {
  const [lat, setLat] = useState('19.076')
  const [lng, setLng] = useState('72.8777')
  const [radius, setRadius] = useState('5')
  const [shops, setShops] = useState<Shop[]>([])
  const [err, setErr] = useState('')
  const [searched, setSearched] = useState(false)

  async function find(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const d = await api(`/shops?lat=${lat}&lng=${lng}&radius=${radius}`)
      setShops(d.shops ?? [])
      setSearched(true)
    } catch (e) { setErr((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">shops near you</h1>
      <form onSubmit={find} className="flex flex-wrap gap-2">
        <input className="rounded border p-2" placeholder="lat" value={lat} onChange={(e) => setLat(e.target.value)} />
        <input className="rounded border p-2" placeholder="lng" value={lng} onChange={(e) => setLng(e.target.value)} />
        <input className="w-20 rounded border p-2" placeholder="km" value={radius} onChange={(e) => setRadius(e.target.value)} />
        <button className="rounded bg-black p-2 text-white">find</button>
      </form>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {searched && shops.length === 0 && <p className="text-gray-600">no shops within {radius} km.</p>}
      <ul className="divide-y">
        {shops.map((s) => (
          <li key={s.id} className="py-3">
            <Link href={`/shops/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
            <div className="text-sm text-gray-600">{s.distance?.toFixed(2)} km away, {s._count?.products} products</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
