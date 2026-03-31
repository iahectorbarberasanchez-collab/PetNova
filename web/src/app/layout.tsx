import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://petnova.app'),
  title: 'PetNova – La App para tu Mascota',
  description: 'La plataforma definitiva para dueños de mascotas. Cartilla médica, red social, alertas y mucho más.',
  keywords: ['mascotas', 'perros', 'gatos', 'veterinario', 'cuidado animal', 'PetNova'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PetNova',
    startupImage: '/icons/icon-512x512.png',
  },
  icons: {
    apple: '/icons/icon-512x512.png',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'PetNova – La App para tu Mascota',
    description: 'Todo lo que tu mascota necesita en un solo lugar.',
    type: 'website',
    siteName: 'PetNova',
    locale: 'es_ES',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PetNova',
  url: 'https://petnova.app',
  logo: 'https://petnova.app/icons/icon-512x512.png',
  description: 'La plataforma definitiva para dueños de mascotas.',
  sameAs: [
    'https://twitter.com/petnova',
    'https://instagram.com/petnova'
  ]
}

export const viewport: Viewport = {
  themeColor: '#6C3FF5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import PWAHandler from '@/components/PWAHandler'
import MobileNav from '@/components/MobileNav'
import MobileHeader from '@/components/MobileHeader'
import { ToastProvider } from '@/components/ToastProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <div className="noise-overlay" />
        <ToastProvider>
          <MobileHeader />
          <PWAHandler />
          {children}
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  )
}
