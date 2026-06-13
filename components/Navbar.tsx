'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/store';

export function Navbar() {
  const { publicKey, disconnect } = useWallet();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!publicKey) { setUsername(null); return; }
    store.getProfileByWallet(publicKey.toBase58()).then(profile => {
      setUsername(profile?.username ?? null);
    });
  }, [publicKey]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleLogout() {
    disconnect();
    setOpen(false);
  }

  return (
    <div className="fixed top-4 sm:top-5 left-0 right-0 z-50 flex justify-center px-4">
      <style>{`
        .liquid-glass-nav {
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 4px 32px rgba(0, 0, 0, 0.35),
            0 1px 0 rgba(255, 255, 255, 0.22) inset,
            0 -1px 0 rgba(0, 0, 0, 0.15) inset;
        }
        .liquid-glass-nav::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.04) 40%,
            rgba(255,255,255,0.0) 60%,
            rgba(255,255,255,0.06) 100%
          );
          pointer-events: none;
        }
        .liquid-glass-nav::after {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255,255,255,0.55) 30%,
            rgba(255,255,255,0.55) 70%,
            transparent
          );
          border-radius: 9999px;
          pointer-events: none;
        }
      `}</style>
      <nav
        className="liquid-glass-nav flex items-center justify-between px-5 h-12 rounded-full"
        style={{ width: 'min(560px, 100%)' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/aero-logo.png" alt="Aero" width={80} height={28} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {mounted ? (
            publicKey && username ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpen(o => !o)}
                  className="flex items-center gap-1.5 h-[30px] px-3.5 rounded-full text-xs transition-colors"
                  style={{
                    background: open ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.75)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  useaero.io/{username}
                  <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                  >
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {open && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '160px',
                      background: 'rgba(12, 12, 12, 0.96)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      padding: '6px',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                      zIndex: 100,
                    }}
                  >
                    <DropdownItem
                      label="Send"
                      icon={
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                      onClick={() => { router.push('/'); setOpen(false); }}
                    />
                    <DropdownItem
                      label="Receive"
                      icon={
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1v10M2 7l5 6 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                      onClick={() => { router.push(`/${username}`); setOpen(false); }}
                    />
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                    <DropdownItem
                      label="Log out"
                      icon={
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                      onClick={handleLogout}
                      danger
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="shrink-0">
                <WalletMultiButton
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '24px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '400',
                    height: '30px',
                    padding: '0 14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '160px',
                  }}
                />
              </div>
            )
          ) : (
            <div className="h-[30px] w-24 rounded-full bg-white/8 animate-pulse" />
          )}
        </div>
      </nav>
    </div>
  );
}

function DropdownItem({
  label,
  icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '8px 10px',
        borderRadius: '9px',
        border: 'none',
        background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: danger
          ? hovered ? '#f87171' : 'rgba(255,100,100,0.7)'
          : hovered ? '#ffffff' : 'rgba(255,255,255,0.6)',
        fontSize: '13px',
        fontWeight: 400,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
