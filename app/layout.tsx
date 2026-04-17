import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ToiBook — Маркетплейс вендоров',
  description: 'Площадки, тамады, фотографы, декор и кейтеринг для мероприятий по всему Казахстану',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen" style={{ background: 'var(--cream)' }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Toast />
      </body>
    </html>
  );
}
