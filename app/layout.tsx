import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], weight: ['200', '300', '400', '500', '600'] });

export const metadata: Metadata = {
  title: 'Aero — Your payment identity',
  description: 'Get paid by anyone. One link. Every payment method.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-ink antialiased font-light`}>
        {/* Global sky-blue glow — sits behind everything including the navbar */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: '#EEF6FB',
            backgroundImage: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(91,192,240,0.22), transparent 70%)',
          }}
        />
        <WalletProvider>
          <Navbar />
          <main className="pt-24 min-h-screen">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
