'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { store, PrivacyLink, AeroProfile } from '@/lib/store';
import { PaymentModal } from '@/components/PaymentModal';
import { explorerUrl } from '@/lib/solana';

export default function PrivacyLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [link, setLink] = useState<PrivacyLink | null | undefined>(undefined);
  const [profile, setProfile] = useState<AeroProfile | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const pl = store.getPrivacyLink(id);
    setLink(pl ?? null);
    if (pl) {
      const p = store.getProfileByWallet(pl.ownerWallet);
      setProfile(p);
    }
  }, [id]);

  if (link === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-4">
        <p className="text-4xl">🔗</p>
        <h1 className="text-ink text-xl font-medium">Link not found</h1>
        <p className="text-ink-muted text-sm font-light">This payment link doesn&apos;t exist.</p>
      </div>
    );
  }

  if (link.used) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-4">
        <div className="w-16 h-16 bg-brand/8 border border-brand/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-ink text-xl font-medium">Link expired</h1>
        <p className="text-ink-muted text-sm max-w-xs font-light">
          This was a one-time privacy link. It has already been used.
        </p>
        {link.txSignature && (
          <a href={explorerUrl(link.txSignature)} target="_blank" rel="noopener noreferrer"
            className="text-brand/60 hover:text-brand text-xs transition-colors">
            View transaction →
          </a>
        )}
        <a href="/" className="text-ink-muted hover:text-brand text-sm transition-colors mt-2">
          Create your own Aero link →
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="bg-navy-card border border-brand/20 rounded-2xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-brand/8 border border-brand/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>

          <div>
            <h1 className="text-ink text-xl font-medium">Anonymous Payment</h1>
            <p className="text-ink-muted text-sm mt-1 font-light">One-time link · No recipient name shown</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 text-left">
            This link expires after a single payment.
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-brand text-white font-medium rounded-xl py-3.5 hover:bg-brand-hover transition-all text-sm"
          >
            Send
          </button>

          <p className="text-ink-subtle text-xs font-light">Powered by Aero</p>
        </div>

        <div className="mt-4 bg-white border border-brand/15 rounded-xl p-4 text-center shadow-sm">
          <p className="text-ink-muted text-xs mb-1 font-light">Want your own payment link?</p>
          <a href="/" className="text-brand text-sm font-medium hover:underline">
            Claim aero.me/yourname →
          </a>
        </div>
      </div>

      {showModal && (
        <PaymentModal
          recipientWallet={link.ownerWallet}
          displayName="Anonymous recipient"
          onClose={() => setShowModal(false)}
          privacyLinkId={id}
        />
      )}
    </div>
  );
}
