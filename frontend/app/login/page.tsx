'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const d = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      const r = d.user.role
      router.push(r === 'VENDOR' ? '/vendor' : r === 'ADMIN' ? '/admin' : '/shops')
      router.refresh()
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
      <h1 className="text-xl font-bold">login</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <input className="w-full rounded border p-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded bg-black p-2 text-white">login</button>
    </form>
  )
}
