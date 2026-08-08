'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const d = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) })
      const r = d.user.role
      router.push(r === 'VENDOR' ? '/vendor' : r === 'ADMIN' ? '/admin' : '/shops')
      router.refresh()
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
      <h1 className="text-xl font-bold">register</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <input className="w-full rounded border p-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="CUSTOMER">customer</option>
        <option value="VENDOR">vendor</option>
      </select>
      <button className="w-full rounded bg-black p-2 text-white">register</button>
      <p className="text-xs text-gray-500">admin accounts are seeded, not self-registered.</p>
    </form>
  )
}
