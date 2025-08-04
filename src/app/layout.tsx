import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '@/components/providers/trpc-provider'
import { SupabaseProvider } from '@/components/providers/supabase-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fircle - Family Circle App',
  description: 'A family management application built with Next.js, tRPC, Prisma, and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
