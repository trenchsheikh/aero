'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { store, AeroProfile, PrivacyLink, PaymentRecord } from '@/lib/store';
import { getBalance, explorerUrl, shortAddress } from '@/lib/solana';
import { v4 as uuidv4 } from 'uuid';

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [profile, setProfile] = useState<AeroProfile | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [privacyLinks, setPrivacyLinks] = useState<PrivacyLink[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'privacy' | 'history'>('overview');

  useEffect(() => {
    if (!publicKey) return;
    const wallet = publicKey.toBase58();
    const p = store.getProfileByWallet(wallet);
    setProfile(p);
    setPrivacyLinks(store.getMyPrivacyLinks(wallet));
    setPayments(store.getPaymentsReceived(wallet));
    getBalance(wallet).then(setBalance);
  }, [publicKey]);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function generatePrivacyLink() {
    if (!publicKey) return;
    const link: PrivacyLink = {
      id: uuidv4(),
      ownerWallet: publicKey.toBase58(),
      used: false,
      createdAt: Date.now(),
    };
    store.savePrivacyLink(link);
    setPrivacyLinks(store.getMyPrivacyLinks(publicKey.toBase58()));
  }

  const profileUrl = profile ? `${window.location.origin}/${profile.username}` : '';

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 px-4 text-center">
        <h1 className="text-ink text-2xl font-medium">Connect your wallet</h1>
        <p className="text-ink-muted text-sm font-light">to access your Aero dashboard</p>
        <WalletMultiButton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 px-4 text-center">
        <h1 className="text-ink text-2xl font-medium">No profile found</h1>
        <p className="text-ink-muted text-sm font-light">Claim your Aero handle to get started</p>
        <button
          onClick={() => router.push('/')}
          className="bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-brand-hover transition-all text-sm"
        >
          Claim your handle →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-ink text-2xl font-semibold">{profile.displayName}</h1>
          <p className="text-brand/70 text-sm mt-0.5 font-light">aero.me/{profile.username}</p>
        </div>
        <div className="text-right">
          {balance !== null && (
            <p className="text-ink font-mono text-lg">{balance.toFixed(4)} SOL</p>
          )}
          <p className="text-ink-muted text-xs font-mono font-light">{shortAddress(publicKey.toBase58())}</p>
        </div>
      </div>

      {/* Payment link card */}
      <div className="bg-navy-card border border-brand/20 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted text-sm font-light">Your payment link</span>
          <span className="text-green-600 text-xs">Active</span>
        </div>
        <div className="flex items-center gap-2 bg-brand/5 border border-brand/15 rounded-xl p-3">
          <span className="flex-1 text-ink-muted text-sm font-mono font-light truncate">{profileUrl}</span>
          <button
            onClick={() => copyToClipboard(profileUrl, 'main')}
            className="text-xs text-brand hover:text-brand-hover transition-colors shrink-0 px-2 py-1 bg-brand/8 rounded-lg"
          >
            {copied === 'main' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/${profile.username}`)}
            className="flex-1 bg-brand text-white text-sm font-medium rounded-xl py-2.5 hover:bg-brand-hover transition-all"
          >
            Preview page
          </button>
          <button
            onClick={() => copyToClipboard(profileUrl, 'share')}
            className="flex-1 bg-brand/8 border border-brand/20 text-ink text-sm font-light rounded-xl py-2.5 hover:bg-brand/15 transition-all"
          >
            {copied === 'share' ? 'Copied!' : 'Share link'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-brand/8 border border-brand/15 rounded-xl p-1">
        {(['overview', 'privacy', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-sm py-2 rounded-lg transition-all capitalize ${
              activeTab === tab
                ? 'bg-brand text-white font-medium shadow-sm'
                : 'text-ink-muted hover:text-ink font-light'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-navy-card border border-brand/15 rounded-xl p-4 shadow-sm">
              <p className="text-ink-muted text-xs mb-1 font-light">Payments received</p>
              <p className="text-ink text-2xl font-semibold">{payments.length}</p>
            </div>
            <div className="bg-navy-card border border-brand/15 rounded-xl p-4 shadow-sm">
              <p className="text-ink-muted text-xs mb-1 font-light">Total SOL received</p>
              <p className="text-ink text-2xl font-semibold font-mono">
                {payments.reduce((s, p) => s + p.amountSol, 0).toFixed(3)}
              </p>
            </div>
          </div>

          <div className="bg-navy-card border border-brand/15 rounded-xl p-4 space-y-2 shadow-sm">
            <p className="text-ink-muted text-xs font-light">Profile</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Handle</span>
                <span className="text-brand font-mono">{profile.username}</span>
              </div>
              {profile.bio && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted font-light">Bio</span>
                  <span className="text-ink-muted max-w-[200px] text-right font-light">{profile.bio}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Network</span>
                <span className="text-ink-muted font-light">Solana</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy links tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ink-muted text-sm font-light">One-time anonymous payment URLs</p>
            <button
              onClick={generatePrivacyLink}
              className="bg-brand text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-brand-hover transition-all"
            >
              + Generate
            </button>
          </div>

          {privacyLinks.length === 0 ? (
            <div className="bg-navy-card border border-brand/15 rounded-xl p-8 text-center shadow-sm">
              <p className="text-ink-muted text-sm font-light">No privacy links yet</p>
              <p className="text-ink-subtle text-xs mt-1 font-light">Generate one to share anonymously</p>
            </div>
          ) : (
            <div className="space-y-2">
              {privacyLinks
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(link => {
                  const url = `${window.location.origin}/p/${link.id}`;
                  return (
                    <div
                      key={link.id}
                      className={`bg-navy-card border rounded-xl p-4 space-y-2 shadow-sm ${
                        link.used ? 'border-brand/8 opacity-50' : 'border-brand/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-ink-muted font-light truncate max-w-[200px]">
                          /p/{link.id.slice(0, 12)}...
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          link.used
                            ? 'text-red-500 border-red-200 bg-red-50'
                            : 'text-green-600 border-green-200 bg-green-50'
                        }`}>
                          {link.used ? 'used' : 'active'}
                        </span>
                      </div>
                      {!link.used && (
                        <div className="flex gap-2">
                          <input
                            readOnly
                            value={url}
                            className="flex-1 bg-brand/5 border border-brand/15 rounded-lg px-3 py-1.5 text-xs text-ink-muted font-mono font-light"
                          />
                          <button
                            onClick={() => copyToClipboard(url, link.id)}
                            className="text-xs text-brand hover:text-brand-hover px-3 py-1.5 bg-brand/8 border border-brand/15 rounded-lg transition-colors shrink-0"
                          >
                            {copied === link.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {link.used && link.txSignature && (
                        <a
                          href={explorerUrl(link.txSignature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand/60 hover:text-brand transition-colors"
                        >
                          View transaction →
                        </a>
                      )}
                      <p className="text-ink-subtle text-xs font-light">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="bg-navy-card border border-brand/15 rounded-xl p-8 text-center shadow-sm">
              <p className="text-ink-muted text-sm font-light">No payments yet</p>
              <p className="text-ink-subtle text-xs mt-1 font-light">Share your link to start receiving</p>
            </div>
          ) : (
            payments.map(p => (
              <div key={p.id} className="bg-navy-card border border-brand/15 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-ink text-sm font-mono font-medium">+{p.amountSol} SOL</p>
                  <p className="text-ink-muted text-xs font-mono font-light mt-0.5">{shortAddress(p.senderWallet)}</p>
                  <p className="text-ink-subtle text-xs font-light mt-0.5">{new Date(p.timestamp).toLocaleString()}</p>
                </div>
                <a
                  href={explorerUrl(p.txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand/60 hover:text-brand text-xs transition-colors"
                >
                  Explorer →
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
