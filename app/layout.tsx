import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: "OOHX — Vietnam's DOOH Marketplace",
  description: 'Kết nối Thương hiệu với Không gian DOOH tốt nhất Việt Nam.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{paddingTop:'var(--nav-h)'}}>
        <Navbar />
        {children}
        <Footer />
        <Toast />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=marker`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
