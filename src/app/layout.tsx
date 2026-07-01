import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './Providers';
import Script from 'next/script';
import { TelegramInit } from '@/components/TelegramInit';

export const metadata: Metadata = {
  metadataBase: new URL('https://ecliptoon.uz'),
  title: {
    default: 'ecliptoon - O\'zbekcha Manhwa, Manga va Komikslar',
    template: '%s | ecliptoon',
  },
  description: 'ecliptoon - O\'zbekistondagi eng yirik o\'zbekcha manhwa, manga va komiks o\'qish platformasi. Sevimli asarlaringizni o\'zbek tilida, yuqori sifatda o\'qing.',
  keywords: [
    'o\'zbekcha manhwa',
    'uzbekcha manhwa',
    'o\'zbekcha komiks',
    'uzbekcha komiks',
    'komiks o\'zbekcha',
    'komiks uzbekcha',
    'manhwa o\'zbekcha',
    'manhwa uzbekcha',
    'manga o\'zbekcha',
    'manga uzbekcha',
    'o\'zbekcha manga',
    'uzbekcha manga',
    'manga o\'zbek',
    'manhua uzbek',
    'tarjima manhwa',
    'tarjima manga',
    'ecliptoon',
    'ecliptoon uz',
    'webtoon o\'zbek tilida',
    'webtoon uzbek tilida',
    'koreys komikslari',
    'o\'zbek tilida manga o\'qish',
    'uzbek tilida manga oqish',
    'manxva',
    'manxua',
    'komikslar'
  ],
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8603051910555547"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.yaContextCb=window.yaContextCb||[]',
          }}
        />
        <script
          async
          src="https://yandex.ru/ads/system/context.js"
        />
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          defer
        />
      </head>
      <body className="bg-slate-950 text-slate-50 min-h-full flex flex-col antialiased">
        <Providers>
          <TelegramInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
