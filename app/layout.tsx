import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Hayley's Dirty Laundry | Fresh laundry, done for you",
  description: 'Friendly local laundry care, collected and returned fresh.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
