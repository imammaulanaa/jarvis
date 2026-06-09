import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JARVIS — Internal Developer Portal",
  description: "Just A Really Versatile Infrastructure System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}