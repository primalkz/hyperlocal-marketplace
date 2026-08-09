'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '../lib'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const d = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) })
      const r = d.user.role
      router.push(r === 'VENDOR' ? '/vendor' : r === 'ADMIN' ? '/admin' : '/shops')
      router.refresh()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm animate-fade-in-up space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">create account</h1>
          <p className="mt-1 text-sm text-gray-500">register as a vendor or customer</p>
        </div>
        {err && <div className="error-box">{err}</div>}
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">password</label>
            <input className="input" type="password" placeholder="min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="CUSTOMER">customer</option>
              <option value="VENDOR">vendor</option>
            </select>
          </div>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'creating…' : 'register'}</button>
        <p className="text-center text-sm text-gray-500">have an account? <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">login</Link></p>
      </form>
    </div>
  )
}
