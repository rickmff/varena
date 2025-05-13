import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: "V Arena",
  description:
    "The best community for V Rising",
  openGraph: {
    images: '/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    images: '/og-image.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
