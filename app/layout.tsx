import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Procesador de Facturas',
  description: 'Sube tus facturas para procesamiento automático',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
