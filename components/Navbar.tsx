'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/store';

export function Navbar() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (publicKey) {
      const profile = store.getProfileByWallet(publicKey.toBase58());
      setUsername(profile?.username ?? null);
    } else {
      setUsername(null);
    }
  }, [publicKey]);

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-4">
      <nav
        className="w-full max-w-3xl rounded-2xl px-4 sm:px-5 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-4"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          border: '1px solid rgba(91, 192, 240, 0.22)',
          boxShadow: '0 2px 20px rgba(91,192,240,0.1), 0 1px 0 rgba(255,255,255,0.9) inset',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-ink font-semibold text-lg tracking-tight">aero</span>
          <span className="text-[10px] text-ink-subtle font-light bg-brand/8 border border-brand/20 rounded-full px-1.5 py-0.5 leading-none hidden xs:inline">
            beta
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 min-w-0">
          {publicKey && username && (
            <Link
              href={`/${username}`}
              className="hidden sm:flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand font-light transition-colors px-3 py-1.5 rounded-xl hover:bg-brand/8"
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              aero.me/{username}
            </Link>
          )}

          {publicKey && username && (
            <button
              onClick={() => router.push(`/${username}`)}
              className="group hidden sm:flex items-center gap-1.5 text-sm font-medium text-white bg-brand hover:bg-brand/80 hover:shadow-[0_2px_12px_rgba(91,192,240,0.35)] transition-all px-4 py-1.5 rounded-xl touch-manipulation"
            >
              Receive
              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          {mounted ? (
            <div className="shrink-0" style={{ maxWidth: '160px' }}>
              <WalletMultiButton
                style={{
                  background: publicKey ? 'rgba(91,192,240,0.1)' : 'rgba(91,192,240,1)',
                  border: '1px solid rgba(91,192,240,0.3)',
                  borderRadius: '12px',
                  color: publicKey ? '#0C1B30' : '#ffffff',
                  fontSize: '13px',
                  fontWeight: '400',
                  height: '34px',
                  padding: '0 12px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: '160px',
                }}
              />
            </div>
          ) : (
            <div className="h-[34px] w-28 sm:w-32 rounded-xl bg-brand/10 animate-pulse" />
          )}
        </div>
      </nav>
    </div>
  );
}
