import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/session-provider"
import type { Metadata, Viewport } from "next"
import { Toaster } from 'sonner'
import { Inter, Junge } from 'next/font/google'
import CookieConsentBanner from "@/components/gdpr/CookieConsentBanner"
import AnalyticsWrapper from "@/components/gdpr/AnalyticsWrapper"

const inter = Inter({ subsets: ['latin'] })
const junge = Junge({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-junge'
})

// Separate viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'V Arena - V Rising Community Server',
  description: 'Join a community of both new and experienced players. Sharpen your skills, test new playstyles, and join your kin for the hunt!',
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
    description: 'Join a community of both new and experienced players. Sharpen your skills, test new playstyles, and join your kin for the hunt!',
    url: 'https://v-arena.com',
    siteName: 'V Arena',
    images: [
      {
        url: '/og-image.png',
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
    description: 'Join a community of both new and experienced players. Sharpen your skills, test new playstyles, and join your kin for the hunt!',
    images: ['/twitter-image.jpg'],
    creator: '@varena',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
        <link href="https://fonts.googleapis.com/css2?family=Junge&display=swap" rel="stylesheet"></link>
      </head>
      <body
        className={`${inter.className} ${junge.variable} antialiased tracking-tight`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <AnalyticsWrapper />
            <CookieConsentBanner />
          </AuthProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
