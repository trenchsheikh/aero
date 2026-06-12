'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { store, AeroProfile } from '@/lib/store';
import { PaymentModal } from '@/components/PaymentModal';
import { shortAddress } from '@/lib/solana';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<AeroProfile | null | undefined>(undefined);
  const [showPayModal, setShowPayModal] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    const p = store.getProfile(username);
    setProfile(p);
  }, [username]);

  if (profile === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', textAlign: 'center', padding: '1rem', background: '#000' }}>
        <h1 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 300, fontFamily: 'var(--font-inter)' }}>@{username} not found</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 300 }}>This handle hasn&apos;t been claimed yet.</p>
        <a href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1px' }}>
          Claim useaero.io/{username}
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem', background: '#000', fontFamily: 'var(--font-inter)' }}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Main card */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', overflow: 'hidden' }}>

          {/* Subtle top line */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)' }} />

          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Name + handle */}
            <div>
              <p style={{ fontSize: '0.5625rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: '0.625rem', fontWeight: 500 }}>
                Payment request
              </p>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {profile.displayName}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', fontWeight: 300, marginTop: '0.375rem' }}>
                useaero.io/{profile.username}
              </p>
              {profile.bio && (
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', fontWeight: 300, marginTop: '0.875rem', lineHeight: 1.65, borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Wallet row */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setWalletOpen(o => !o)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 300 }}>Verified wallet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{shortAddress(profile.walletAddress)}</span>
                  <svg
                    style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.25)', transition: 'transform 0.2s', transform: walletOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div style={{ overflow: 'hidden', maxHeight: walletOpen ? '8rem' : 0, transition: 'max-height 0.2s ease', paddingBottom: walletOpen ? '0.75rem' : 0 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                      {profile.walletAddress}
                    </p>
                    <button
                      onClick={() => copyAddress(profile.walletAddress)}
                      style={{ flexShrink: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontWeight: 500, whiteSpace: 'nowrap' }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 300 }}>Solana · Mainnet</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowPayModal(true)}
              style={{
                fontFamily: 'var(--font-inter)',
                background: '#ffffff',
                color: '#000000',
                fontWeight: 500,
                fontSize: '0.9375rem',
                padding: '0.9375rem',
                borderRadius: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                letterSpacing: '-0.01em',
              }}
            >
              Send to {profile.displayName}
            </button>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.6875rem', fontWeight: 300, letterSpacing: '0.04em' }}>
              Secured by Aero · Solana
            </p>
          </div>
        </div>

        {/* Footer nudge */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 300 }}>Want your own payment link?</p>
          <a href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1px', flexShrink: 0, marginLeft: '1rem' }}>
            Claim yours
          </a>
        </div>

      </div>

      {showPayModal && (
        <PaymentModal
          recipientWallet={profile.walletAddress}
          recipientUsername={profile.username}
          displayName={profile.displayName}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
}
