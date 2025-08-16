import type React from "react"
import type { Metadata } from "next"
import { Abril_Fatface, Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-abril-fatface",
  weight: ["400"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-spoof",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "HireHub - Internship Portal",
  description: "Modern internship application portal connecting students with meaningful opportunities",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#4D77D1", // HireHub accent blue
          colorBackground: "#F8F7FA", // HireHub light neutral
          colorText: "#1D174C", // HireHub primary dark
        },
      }}
    >
      <html lang="en" className={`${abrilFatface.variable} ${inter.variable} antialiased`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
