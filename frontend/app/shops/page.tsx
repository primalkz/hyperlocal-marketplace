'use client'

import { useEffect, useState } from 'react'
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

  async function search() {
    setErr('')
    try {
      const d = await api(`/shops?lat=${lat}&lng=${lng}&radius=${radius}`)
      setShops(d.shops ?? [])
      setSearched(true)
    } catch (e) { setErr((e as Error).message) }
  }

  useEffect(() => { search() }, [])

  async function find(e: React.FormEvent) {
    e.preventDefault()
    search()
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">shops near you</h1>
      <form onSubmit={find} className="flex flex-wrap gap-2">
        <input className="input flex-1" placeholder="latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
        <input className="input flex-1" placeholder="longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
        <input className="input w-24" placeholder="km" value={radius} onChange={(e) => setRadius(e.target.value)} />
        <button className="btn-primary">find</button>
      </form>
      {err && <div className="error-box">{err}</div>}
      {searched && shops.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">no shops within {radius} km</p>
          <p className="mt-1 text-xs text-gray-400">try increasing the search radius</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {shops.map((s) => (
          <Link key={s.id} href={`/shops/${s.id}`} className="card transition-all hover:shadow-card-hover hover:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{s.name}</span>
              <span className="text-sm font-medium text-emerald-600">{s.distance?.toFixed(1)} km</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{s._count?.products} products available</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
