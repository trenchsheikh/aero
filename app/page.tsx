'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { store, AeroProfile } from '@/lib/store';
import { ScrollSection } from '@/components/ScrollSection';

/* ─── Chain carousel ─── */

function ChainCarousel() {
  return (
    <>
      <style>{`
        .eth-logo { height: 120px; }
        .sol-logo { height: 26px; }
        .chain-grid { gap: 3rem; }
        @media (max-width: 640px) {
          .eth-logo { height: 60px; }
          .sol-logo { height: 18px; }
          .chain-grid { gap: 1.25rem; }
        }
      `}</style>
      <div
        className="chain-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          padding: '2rem 1.5rem 2.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <img
            src="/eth-logo-landscape-(purple).svg"
            alt="Ethereum"
            draggable={false}
            className="eth-logo"
            style={{ width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.18, userSelect: 'none' }}
          />
        </div>
        <img
          src="/solanaLogo.svg"
          alt="Solana"
          draggable={false}
          className="sol-logo"
          style={{ width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.5, userSelect: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <img
            src="/eth-logo-landscape-(purple).svg"
            alt="Ethereum"
            draggable={false}
            className="eth-logo"
            style={{ width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.18, userSelect: 'none' }}
          />
        </div>
      </div>
    </>
  );
}

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
  const [showClaimForm, setShowClaimForm] = useState(false);
  const claimRef = useRef<HTMLDivElement>(null);

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

  function handleGetStarted() {
    setShowClaimForm(true);
    setTimeout(() => {
      claimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  return (
    <div style={{ background: '#000', color: '#fff' }}>

      {/* ─────────────────── HERO ─────────────────── */}
      <section
        className="relative flex flex-col"
        style={{ minHeight: '100vh' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />

        {/* Main content — takes all space above the carousel */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingTop: '6rem', paddingBottom: '3rem' }}
        >
          <div className="max-w-4xl mx-auto w-full">
          {/* Main heading */}
          <h1
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 600,
              fontSize: 'clamp(2rem, 7vw, 61px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
            }}
          >
            Your payment identity.
            <br />
            <span>Get paid by </span>
            <em
              style={{
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
                fontWeight: 700,
              }}
            >
              anyone.
            </em>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto"
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              fontWeight: 300,
              maxWidth: '28rem',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            Your non-custodial friction-less payment method.
          </p>

          {/* CTA buttons */}
          {existingProfile ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => setShowSendModal(true)}
                className="transition-opacity hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '0.75rem 2rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
              <button
                onClick={() => router.push(`/${existingProfile.username}`)}
                className="transition-colors hover:bg-white/10"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  padding: '0.75rem 2rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                }}
              >
                My profile
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="transition-opacity hover:opacity-85"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '0.75rem 2rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Get Started
              </button>
              <a
                href="#overview"
                className="transition-colors hover:bg-white/10"
                style={{
                  fontFamily: 'var(--font-inter)',
                  display: 'inline-block',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  padding: '0.75rem 2rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none',
                }}
              >
                Learn More
              </a>
            </div>
          )}

          {/* ── Claim form — appears on "Get Started" ── */}
          {showClaimForm && !existingProfile && (
            <div
              ref={claimRef}
              className="mx-auto mt-12 w-full text-left"
              style={{ maxWidth: '22rem' }}
            >
              {step === 'claim' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Username input */}
                  <div
                    className="flex items-center focus-within:border-white/40 transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.35)', paddingLeft: '1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      aerome.io/
                    </span>
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
                      maxLength={20}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        padding: '1rem 0.5rem',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        outline: 'none',
                        minWidth: 0,
                      }}
                    />
                  </div>

                  {usernameError && (
                    <p style={{ color: '#f87171', fontSize: '0.75rem', paddingLeft: '0.25rem' }}>{usernameError}</p>
                  )}

                  {mounted && !publicKey ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', textAlign: 'center' }}>
                        Connect your wallet to continue
                      </p>
                      <WalletMultiButton
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: '16px',
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: '400',
                          height: '50px',
                          width: '100%',
                          justifyContent: 'center',
                        }}
                      />
                    </div>
                  ) : publicKey ? (
                    <button
                      onClick={handleClaimUsername}
                      disabled={checking || username.length < 3}
                      style={{
                        background: '#ffffff',
                        color: '#000000',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        padding: '0.875rem',
                        borderRadius: '16px',
                        border: 'none',
                        cursor: checking || username.length < 3 ? 'not-allowed' : 'pointer',
                        opacity: checking || username.length < 3 ? 0.3 : 1,
                        width: '100%',
                      }}
                    >
                      {checking ? 'Checking...' : 'Claim username'}
                    </button>
                  ) : null}
                </div>
              )}

              {step === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Available badge */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>aerome.io/</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{username}</span>
                    <span style={{ marginLeft: '0.5rem', color: '#4ade80', fontSize: '0.75rem' }}>available</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>
                      Display name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={username}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '12px',
                        padding: '0.875rem 1rem',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>
                      Bio <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="What you do..."
                      maxLength={120}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '12px',
                        padding: '0.875rem 1rem',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    onClick={handleCreateProfile}
                    disabled={!publicKey}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      padding: '0.875rem',
                      borderRadius: '16px',
                      border: 'none',
                      cursor: !publicKey ? 'not-allowed' : 'pointer',
                      opacity: !publicKey ? 0.3 : 1,
                      width: '100%',
                    }}
                  >
                    Create my Aero profile
                  </button>

                  <button
                    onClick={() => setStep('claim')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      width: '100%',
                    }}
                  >
                    ← Change username
                  </button>
                </div>
              )}
            </div>
          )}
          </div>{/* /max-w-4xl */}
        </div>{/* /flex-1 content */}

        {/* ── Chain carousel pinned to bottom of hero ── */}
        <ChainCarousel />
      </section>

      {/* ─────────────────── OVERVIEW ─────────────────── */}
      <section
        id="overview"
        style={{ background: '#EEEDE9', color: '#0a0a0a', padding: '5rem 1.5rem' }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Heading */}
          <h2
            className="text-center"
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 600,
              fontSize: 'clamp(2rem, 7vw, 61px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: '4rem',
            }}
          >
            Designed for your security.
          </h2>

          {/* Phone + floating features */}
          <div className="relative flex items-center justify-center" style={{ minHeight: '760px' }}>

            {/* Left features — desktop */}
            <div
              className="hidden lg:flex flex-col gap-8 absolute"
              style={{ left: 0, top: '50%', transform: 'translateY(-50%)', maxWidth: '190px' }}
            >
              <FeatureItem
                title="On-chain verified"
                desc="Every transaction verifiable on the Solana blockchain."
              />
              <FeatureItem
                title="Non-custodial"
                desc="Your keys, your funds — always."
              />
            </div>

            {/* Phone mockup */}
            <PhoneMockup />

            {/* Right features — desktop */}
            <div
              className="hidden lg:flex flex-col gap-8 absolute"
              style={{ right: 0, top: '50%', transform: 'translateY(-50%)', maxWidth: '190px', textAlign: 'right' }}
            >
              <FeatureItem
                title="Sub-second"
                desc="Payments settle in under 400ms on Solana."
                align="right"
              />
              <FeatureItem
                title="Privacy first"
                desc="No personal data stored. Your identity stays yours."
                align="right"
              />
            </div>
          </div>

          {/* Mobile feature grid */}
          <div
            className="grid grid-cols-2 gap-4 mt-10 lg:hidden"
          >
            {[
              { title: 'On-chain verified', desc: 'Every transaction verifiable on the Solana blockchain.' },
              { title: 'Non-custodial', desc: 'Your keys, your funds — always.' },
              { title: 'Sub-second', desc: 'Payments settle in under 400ms on Solana.' },
              { title: 'Privacy first', desc: 'No personal data stored. Your identity stays yours.' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '1rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <p style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.35rem' }}>{f.title}</p>
                <p style={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── SCROLL / PARALLAX ─────────────────── */}
      <ScrollSection />

      {/* ─────────────────── SEND MODAL ─────────────────── */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center sm:p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowSendModal(false)}
          />
          <div
            className="relative w-full sm:max-w-sm"
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.25rem 1.25rem 0 0',
              padding: '1.25rem 1.25rem 2rem',
              boxShadow: '0 -4px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Drag handle */}
            <div className="sm:hidden flex justify-center mb-3">
              <div style={{ width: '2.5rem', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px' }} />
            </div>

            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', fontWeight: 500, fontSize: '1.125rem' }}>Send</h2>
              <button
                onClick={() => setShowSendModal(false)}
                style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1, padding: '0.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>
                Aero username
              </label>
              <div
                className="flex items-center focus-within:border-white/35 transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.35)', paddingLeft: '1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  aerome.io/
                </span>
                <input
                  type="text"
                  value={sendTarget}
                  onChange={e => { setSendTarget(e.target.value); setSendError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendPayment()}
                  placeholder="username"
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    padding: '0.875rem 0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
              </div>
              {sendError && (
                <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.375rem', paddingLeft: '0.25rem' }}>{sendError}</p>
              )}
            </div>

            <button
              onClick={handleSendPayment}
              style={{
                background: '#ffffff',
                color: '#000000',
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: '0.875rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Go to payment page →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function FeatureItem({
  title,
  desc,
  align = 'left',
}: {
  title: string;
  desc: string;
  align?: 'left' | 'right';
}) {
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{ display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}
      >
        <span
          style={{
            background: '#ffffff',
            color: '#0a0a0a',
            fontWeight: 600,
            fontSize: '0.8125rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '6px',
            display: 'inline-block',
          }}
        >
          {title}
        </span>
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.55 }}>
        {desc}
      </p>
    </div>
  );
}

function PhoneMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        flexShrink: 0,
        transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease',
        transform: visible ? 'translateY(0)' : 'translateY(56px)',
        opacity: visible ? 1 : 0,
      }}
    >
      <Image
        src="/handphone.png"
        alt="Aero app"
        width={420}
        height={840}
        style={{ objectFit: 'contain', display: 'block' }}
        priority
      />
    </div>
  );
}
