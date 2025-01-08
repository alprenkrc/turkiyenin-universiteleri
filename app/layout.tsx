import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Türkiye\'nin Üniversite Haritası',
  description: 'Türkiye\'deki üniversiteleri listeleyen etkileşimli harita.',
  keywords: ['üniversite', 'harita', 'türkiye', 'yök', 'atlas', 'devlet', 'vakıf', 'kuruluş', 'yıl', 'şehir', 'koordinat','yök atlas', 'üniversite haritası'],
  abstract: 'Türkiye\'nin Üniversite Haritası',
  icons: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='80'>🌙</text></svg>"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const gaId: string = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || '';


  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-100`}>
        {children}
      </body>
      <GoogleAnalytics gaId={gaId} />
    </html>
  )
} 