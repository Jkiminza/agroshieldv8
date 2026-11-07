import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { WagmiProvider } from '@/components/wagmi-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgroShield - Parametric Crop Insurance for African Farmers',
  description: 'Instant payouts when drought strikes. Protect your harvest with blockchain-verified insurance.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#19a463',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0a0f1e]" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <WagmiProvider>
          {children}
        </WagmiProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
