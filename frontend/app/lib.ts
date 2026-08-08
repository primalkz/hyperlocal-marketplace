export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> | undefined) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'request failed')
  return data
}

export type Session = { userId: string; role: string } | null
export type Product = { id: string; shopId: string; title: string; image: string; price: number; available: boolean }
export type Shop = { id: string; name: string; latitude: number; longitude: number; status: string; distance?: number; _count?: { products: number } }
