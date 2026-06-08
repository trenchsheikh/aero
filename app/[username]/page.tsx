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
      <div className="flex items-center justify-center min-h-[calc(100vh-96px)]">
        <div className="w-5 h-5 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)] gap-4 text-center px-4">
        <h1 className="text-ink text-xl font-light">@{username} not found</h1>
        <p className="text-ink-muted text-sm font-light">This handle hasn&apos;t been claimed yet.</p>
        <a href="/" className="text-brand hover:text-brand-hover text-sm transition-colors">
          Claim aero.me/{username} →
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-3">

        {/* Main card */}
        <div className="bg-white border border-brand/20 rounded-2xl overflow-hidden shadow-sm">

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-brand/40 via-brand to-brand/40" />

          <div className="px-8 pt-8 pb-6 space-y-6">

            {/* Name + handle */}
            <div>
              <p className="text-xs text-ink-subtle font-light tracking-widest uppercase mb-2">Payment request</p>
              <h1 className="text-3xl font-extralight text-ink tracking-wide">{profile.displayName}</h1>
              <p className="text-brand text-sm font-light mt-1">aero.me/{profile.username}</p>
              {profile.bio && (
                <p className="text-ink-muted text-sm font-light mt-3 leading-relaxed border-l-2 border-brand/20 pl-3">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Wallet row — expandable */}
            <div className="border-y border-brand/10">
              <button
                onClick={() => setWalletOpen(o => !o)}
                className="w-full flex items-center justify-between py-3 group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-ink-subtle text-xs font-light">Verified wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted text-xs font-mono">{shortAddress(profile.walletAddress)}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-ink-subtle transition-transform duration-200 ${walletOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              <div className={`overflow-hidden transition-all duration-200 ${walletOpen ? 'max-h-32 pb-3' : 'max-h-0'}`}>
                <div className="bg-brand/5 border border-brand/15 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-ink-muted text-xs font-mono break-all leading-relaxed">
                      {profile.walletAddress}
                    </p>
                    <button
                      onClick={() => copyAddress(profile.walletAddress)}
                      className="shrink-0 text-xs text-brand hover:text-brand-hover font-medium transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-ink-subtle text-xs font-light">Solana · Mainnet</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowPayModal(true)}
              className="group w-full bg-brand text-white font-medium rounded-xl py-3.5 hover:bg-brand/80 hover:shadow-[0_4px_20px_rgba(91,192,240,0.35)] transition-all flex items-center justify-center gap-2"
            >
              Send to {profile.displayName}
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <p className="text-center text-ink-subtle text-xs font-light">Secured by Aero · Solana</p>
          </div>
        </div>

        {/* Footer nudge */}
        <div className="bg-white/60 border border-brand/10 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-sm">
          <p className="text-ink-muted text-xs font-light">Want your own payment link?</p>
          <a href="/" className="text-brand text-xs font-medium hover:underline shrink-0 ml-4">
            Claim yours →
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
