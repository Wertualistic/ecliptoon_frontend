import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://ecliptoon.uz'),
  title: {
    default: 'ecliptoon - Manhwa, Manga va Manhualar o\'zbek tilida',
    template: '%s | ecliptoon',
  },
  description: 'ecliptoon - O\'zbekistondagi eng yirik webtoon va manga o\'qish platformasi. Olmoslar yordamida yangi boblarni birinchilardan bo\'lib oching va sevimli asarlaringizni o\'zbek tilida o\'qing.',
  keywords: ['manhwa o\'zbekcha', 'manga o\'zbek', 'manhua uzbek', 'tarjima manhwa', 'ecliptoon', 'webtoon o\'zbek tilida', 'koreys komikslari', 'o\'zbek tilida manga o\'qish', 'manxva', 'manxua'],
  authors: [{ name: 'ecliptoon Team' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'ecliptoon - Webtoon platformasi',
    description: 'ecliptoon - O\'zbekistondagi eng yirik webtoon va manga o\'qish platformasi. Sevimli asarlaringizni o\'zbek tilida o\'qing.',
    url: 'https://ecliptoon.uz',
    siteName: 'ecliptoon',
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ecliptoon - Webtoon platformasi',
    description: 'ecliptoon - O\'zbekistondagi eng yirik webtoon va manga o\'qish platformasi.',
  },
  verification: {
    // google: 'your-google-verification-code', // ready for when they sign up for google search console
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark h-full">
      <body className="bg-slate-950 text-slate-50 min-h-full flex flex-col antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
