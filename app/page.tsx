'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { store, AeroProfile } from '@/lib/store';
import { Features } from '@/components/blocks/features-8';

type Step = 'claim' | 'profile';

export default function HomePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('claim');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checking, setChecking] = useState(false);
  const [existingProfile, setExistingProfile] = useState<AeroProfile | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTarget, setSendTarget] = useState('');
  const [sendError, setSendError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (publicKey) {
      const profile = store.getProfileByWallet(publicKey.toBase58());
      if (profile) setExistingProfile(profile);
    }
  }, [publicKey]);

  function validateUsername(val: string) {
    return /^[a-z0-9_]{3,20}$/.test(val);
  }

  async function handleClaimUsername() {
    if (!validateUsername(username)) {
      setUsernameError('3–20 chars, lowercase letters, numbers, underscores only');
      return;
    }
    setChecking(true);
    await new Promise(r => setTimeout(r, 300));
    if (!store.usernameAvailable(username)) {
      setUsernameError('That username is taken');
      setChecking(false);
      return;
    }
    setChecking(false);
    setUsernameError('');
    setStep('profile');
  }

  function handleCreateProfile() {
    if (!publicKey) return;
    const profile: AeroProfile = {
      username: username.toLowerCase(),
      displayName: displayName || username,
      bio,
      walletAddress: publicKey.toBase58(),
      createdAt: Date.now(),
    };
    store.saveProfile(profile);
    router.push(`/${profile.username}`);
  }

  function handleSendPayment() {
    const target = sendTarget.trim().toLowerCase().replace(/^@/, '');
    if (!target) { setSendError('Enter a username'); return; }
    const profile = store.getProfile(target);
    if (profile) {
      router.push(`/${target}`);
    } else {
      setSendError('No Aero profile found for that username');
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-wide text-ink leading-tight">
            Your payment identity.
            <br className="hidden sm:block" />
            {' '}<span className="text-brand">Get paid by anyone.</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-md mx-auto leading-relaxed font-light">
            Claim your handle. Share one link. Anyone pays you instantly. No addresses, no friction.
          </p>

          {existingProfile ? (
            <div className="flex flex-col items-center gap-3 mt-6 sm:mt-8">
              <p className="text-ink-subtle text-sm font-light">
                aero.me/<span className="text-brand font-medium">{existingProfile.username}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
                <button
                  onClick={() => setShowSendModal(true)}
                  className="group flex-1 flex items-center justify-center gap-2 bg-white border border-brand/25 text-ink font-medium rounded-xl px-6 py-4 sm:py-3.5 hover:bg-brand/8 hover:border-brand/50 hover:text-brand transition-all shadow-sm touch-manipulation"
                >
                  Send
                  <svg className="w-4 h-4 text-brand transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push(`/${existingProfile.username}`)}
                  className="group flex-1 flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-4 sm:py-3.5 hover:bg-brand/80 hover:shadow-[0_4px_20px_rgba(91,192,240,0.4)] transition-all shadow-sm touch-manipulation"
                >
                  Receive
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          ) : step === 'claim' ? (
            <div className="mt-6 sm:mt-8 w-full max-w-xs sm:max-w-sm mx-auto space-y-3">
              <div className="flex items-center bg-white border border-brand/25 rounded-xl overflow-hidden focus-within:border-brand/60 transition-colors shadow-sm">
                <span className="text-ink-subtle pl-4 text-sm whitespace-nowrap">aero.me/</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    setUsernameError('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleClaimUsername()}
                  placeholder="yourname"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="text"
                  className="flex-1 bg-transparent px-2 py-4 text-ink placeholder-ink-subtle/50 focus:outline-none text-sm font-light min-w-0"
                  maxLength={20}
                />
              </div>
              {usernameError && (
                <p className="text-red-500 text-xs text-left pl-1">{usernameError}</p>
              )}
              {mounted && !publicKey ? (
                <div className="space-y-2">
                  <p className="text-ink-muted text-xs font-light">Connect your wallet to continue</p>
                  <WalletMultiButton
                    style={{
                      background: '#5BC0F0',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '400',
                      height: '48px',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  />
                </div>
              ) : publicKey ? (
                <button
                  onClick={handleClaimUsername}
                  disabled={checking || username.length < 3}
                  className="w-full bg-brand text-white font-medium rounded-xl py-4 sm:py-3.5 hover:bg-brand-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm touch-manipulation"
                >
                  {checking ? 'Checking...' : 'Claim username'}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 sm:mt-8 w-full max-w-xs sm:max-w-sm mx-auto space-y-4 text-left">
              <div className="bg-brand/8 border border-brand/25 rounded-xl p-3 text-sm text-ink-muted">
                <span className="text-ink-subtle">aero.me/</span>
                <span className="text-ink font-medium">{username}</span>
                <span className="ml-2 text-green-500 text-xs">available</span>
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1.5">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder={username}
                  className="w-full bg-white border border-brand/25 rounded-xl px-4 py-3.5 text-ink placeholder-ink-subtle focus:outline-none focus:border-brand/60 transition-colors text-sm font-light shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1.5">Bio <span className="text-ink-subtle">(optional)</span></label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="What you do..."
                  className="w-full bg-white border border-brand/25 rounded-xl px-4 py-3.5 text-ink placeholder-ink-subtle focus:outline-none focus:border-brand/60 transition-colors text-sm font-light shadow-sm"
                  maxLength={120}
                />
              </div>
              <button
                onClick={handleCreateProfile}
                disabled={!publicKey}
                className="w-full bg-brand text-white font-medium rounded-xl py-4 sm:py-3.5 hover:bg-brand-hover disabled:opacity-30 transition-all text-sm touch-manipulation"
              >
                Create my Aero profile →
              </button>
              <button
                onClick={() => setStep('claim')}
                className="w-full text-ink-subtle hover:text-ink-muted text-xs transition-colors py-2"
              >
                ← Change username
              </button>
            </div>
          )}
        </div>
      </section>

      <Features />

      {/* Send modal — bottom sheet on mobile */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-ink/15 backdrop-blur-sm"
            onClick={() => setShowSendModal(false)}
          />
          <div className="relative bg-white border border-brand/20 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm px-5 pt-5 pb-8 sm:pb-5 shadow-xl space-y-4">
            {/* Drag handle on mobile */}
            <div className="sm:hidden flex justify-center mb-1">
              <div className="w-10 h-1 bg-brand/20 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-ink font-medium text-lg">Send</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-ink-subtle hover:text-brand text-xl leading-none transition-colors p-1 touch-manipulation"
              >
                ×
              </button>
            </div>
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Aero username</label>
              <div className="flex items-center bg-white border border-brand/25 rounded-xl overflow-hidden focus-within:border-brand/60 transition-colors shadow-sm">
                <span className="text-ink-subtle pl-4 text-sm whitespace-nowrap">aero.me/</span>
                <input
                  type="text"
                  value={sendTarget}
                  onChange={e => { setSendTarget(e.target.value); setSendError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendPayment()}
                  placeholder="username"
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="text"
                  className="flex-1 bg-transparent px-2 py-3.5 text-ink placeholder-ink-subtle/50 focus:outline-none text-sm font-light min-w-0"
                />
              </div>
              {sendError && <p className="text-red-500 text-xs mt-1.5 pl-1">{sendError}</p>}
            </div>
            <button
              onClick={handleSendPayment}
              className="w-full bg-brand text-white font-medium rounded-xl py-4 sm:py-3 hover:bg-brand-hover transition-all text-sm touch-manipulation"
            >
              Go to payment page →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
