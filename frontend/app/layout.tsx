import './globals.css'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Nav from './nav'

const dm = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans' })

export const metadata: Metadata = { title: 'Hyperlocal, Local Grocery, Nearby', description: 'Find shops near you and order groceries from local vendors.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dm.variable}>
      <body className="min-h-[100dvh] bg-gray-50 font-sans text-gray-900 antialiased">
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-gray-200/60 mt-12">
          <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-gray-400">hyperlocal marketplace</div>
        </footer>
      </body>
    </html>
  )
}
