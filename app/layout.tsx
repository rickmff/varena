import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata, Viewport } from "next"
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// Separate viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'V Arena - V Rising Community Server',
  description: 'Join V Arena, the premier V Rising community server featuring custom game modes, events, and an active community of vampire enthusiasts.',
  keywords: 'V Rising, V Arena, gaming, vampire, community server, PvP, events',
  authors: [{ name: 'V Arena Team' }],
  creator: 'V Arena',
  publisher: 'V Arena',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://v-arena.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'V Arena - V Rising Community Server',
    description: 'Join V Arena, the premier V Rising community server featuring custom game modes, events, and an active community of vampire enthusiasts.',
    url: 'https://v-arena.com',
    siteName: 'V Arena',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'V Arena - V Rising Community Server',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'V Arena - V Rising Community Server',
    description: 'Join V Arena, the premier V Rising community server featuring custom game modes, events, and an active community of vampire enthusiasts.',
    images: ['/twitter-image.jpg'],
    creator: '@varena',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: ['/apple-touch-icon.png'],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    title: 'V Arena',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
