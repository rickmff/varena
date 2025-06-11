import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata, Viewport } from "next"
import { Toaster } from 'sonner'
import { Inter, Junge } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"

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
        <meta name="description" content="Join a community of both new and experienced players. Sharpen your skills, test new playstyles, and join your kin for the hunt!" />
        <meta property="og:url" content="https://v-arena.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="V Arena - V Rising Community Server" />
        <meta property="og:description" content="Join a community of both new and experienced players. Sharpen your skills, test new playstyles, and join your kin for the hunt!" />
        <meta property="og:image" content="https://v-arena.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="v-arena.com" />
        <meta property="twitter:url" content="https://v-arena.com" />
        <meta name="twitter:title" content="V Arena - V Rising Community Server" />
        <meta name="twitter:description" content="Join a community of both new and experienced players. Sharpen your skills, test new playstyles, and join your kin for the hunt!" />
        <meta name="twitter:image" content="https://v-arena.com/og-image.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link href="https://fonts.googleapis.com/css2?family=Junge&display=swap" rel="stylesheet"></link>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${inter.className} ${junge.variable} antialiased tracking-tight`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
