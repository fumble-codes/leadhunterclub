import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import ClientLayout from './ClientLayout'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leadhunterclub.com'

export const metadata: Metadata = {
  title: 'LeadHunterClub — AI-Powered Lead Generation & Sales Intelligence',
  description:
    'Find and close more deals with AI-powered lead generation, buyer-intent signals, and advanced analytics. The all-in-one platform for modern sales teams.',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'LeadHunterClub — AI-Powered Lead Generation & Sales Intelligence',
    description:
      'Find and close more deals with AI-powered lead generation, buyer-intent signals, and advanced analytics.',
    url: appUrl,
    siteName: 'LeadHunterClub',
    images: [{ url: `${appUrl}/logo.svg`, width: 1080, height: 1080 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadHunterClub — AI-Powered Lead Generation & Sales Intelligence',
    description:
      'Find and close more deals with AI-powered lead generation, buyer-intent signals, and advanced analytics.',
    images: [`${appUrl}/logo.svg`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LeadHunterClub',
              url: appUrl,
              logo: `${appUrl}/logo.svg`,
              description:
                'AI-powered lead generation and sales intelligence platform for modern sales teams.',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'LeadHunterClub',
              url: appUrl,
            }),
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${GeistMono.variable} font-sans antialiased bg-page-bg text-white`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
