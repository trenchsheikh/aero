import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SmoothScroll } from '@/components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['400', '700'],
  variable: '--font-playfair',
});


export const metadata: Metadata = {
  title: 'Aero — Your payment identity',
  description: 'Get paid by anyone. One link. Every payment method.',
  icons: { icon: '/aero-logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter)', background: '#000000', color: '#ffffff' }}
      >
        <WalletProvider>
          <SmoothScroll />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
