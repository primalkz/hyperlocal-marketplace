import './globals.css'
import type { Metadata } from 'next'
import Nav from './nav'

export const metadata: Metadata = { title: 'Hyperlocal Marketplace', description: 'local grocery, nearby' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-4xl px-4 pb-10 text-center text-xs text-gray-400">hyperlocal marketplace</footer>
      </body>
    </html>
  )
}
