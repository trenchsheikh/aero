'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { buildTransferTx, explorerUrl, getBalance } from '@/lib/solana';
import { store, PaymentRecord } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

interface PaymentModalProps {
  recipientWallet: string;
  recipientUsername?: string;
  displayName: string;
  onClose: () => void;
  privacyLinkId?: string;
}

type Step = 'amount' | 'confirm' | 'success' | 'error';

interface PayError {
  title: string;
  detail: string;
  canRetry: boolean;
  action?: string;
}

const TX_FEE_BUFFER = 0.000015;

function classifyError(e: unknown): PayError {
  const raw = e instanceof Error ? e.message : String(e);
  const lower = raw.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('rejected the request') || lower.includes('cancelled') || lower.includes('canceled'))
    return { title: 'Payment cancelled', detail: 'You declined the transaction in your wallet.', canRetry: true, action: 'Try again' };
  if (lower.includes('insufficient') || lower.includes('0x1') || lower.includes('insufficient lamports') || lower.includes('not enough sol'))
    return { title: 'Insufficient funds', detail: "Your wallet doesn't have enough SOL to cover this payment plus the network fee.", canRetry: true, action: 'Change amount' };
  if (lower.includes('blockhash not found') || lower.includes('block height exceeded') || lower.includes('blockhash expired'))
    return { title: 'Transaction expired', detail: 'The transaction took too long and expired. This can happen when the network is congested.', canRetry: true, action: 'Try again' };
  if (lower.includes('already been processed') || lower.includes('already processed'))
    return { title: 'Already sent', detail: 'This transaction was already processed — your funds were sent.', canRetry: false, action: 'Close' };
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('econnrefused') || lower.includes('timeout') || lower.includes('503') || lower.includes('429'))
    return { title: 'Network error', detail: 'Could not reach the Solana network. Check your connection and try again.', canRetry: true, action: 'Try again' };
  if (lower.includes('wallet not connected') || lower.includes('not connected'))
    return { title: 'Wallet disconnected', detail: 'Your wallet disconnected during the transaction. Reconnect and try again.', canRetry: true, action: 'Try again' };
  if (lower.includes('simulation failed') || lower.includes('0x0'))
    return { title: 'Transaction failed', detail: 'Solana rejected the transaction during simulation. Your funds were not sent.', canRetry: true, action: 'Try again' };
  return { title: 'Something went wrong', detail: raw.length < 120 ? raw : 'An unexpected error occurred. Your funds were not sent.', canRetry: true, action: 'Try again' };
}

const card: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  position: 'relative',
  background: '#111111',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '1.25rem 1.25rem 0 0',
  width: '100%',
  padding: '1.25rem 1.25rem 2rem',
  boxShadow: '0 -4px 60px rgba(0,0,0,0.8)',
};

const cardSm: React.CSSProperties = {
  borderRadius: '1.25rem',
  maxWidth: '26rem',
  padding: '1.5rem',
};

export function PaymentModal({ recipientWallet, recipientUsername, displayName, onClose, privacyLinkId }: PaymentModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [txSig, setTxSig] = useState('');
  const [payError, setPayError] = useState<PayError | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  const presets = [0.01, 0.05, 0.1, 0.5];

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsSmall(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    setBalanceLoading(true);
    getBalance(publicKey.toBase58()).then(setBalance).finally(() => setBalanceLoading(false));
  }, [publicKey]);

  function validateAmount(val: string): string {
    const sol = parseFloat(val);
    if (!val || isNaN(sol)) return '';
    if (sol <= 0) return 'Amount must be greater than 0';
    if (sol < 0.000001) return 'Minimum amount is 0.000001 SOL';
    if (balance !== null && sol + TX_FEE_BUFFER > balance) {
      const max = Math.max(0, balance - TX_FEE_BUFFER);
      return `Insufficient funds. Max: ${max.toFixed(5)} SOL`;
    }
    return '';
  }

  function handleAmountChange(val: string) {
    setAmount(val);
    setAmountError(validateAmount(val));
  }

  async function handlePay() {
    if (!publicKey || !amount) return;
    const sol = parseFloat(amount);
    const err = validateAmount(amount);
    if (err) { setAmountError(err); return; }
    setStep('confirm');
    try {
      const toPubkey = new PublicKey(recipientWallet);
      const tx = await buildTransferTx(publicKey, toPubkey, sol);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');
      const record: PaymentRecord = {
        id: uuidv4(), recipientUsername, recipientWallet,
        senderWallet: publicKey.toBase58(), amountSol: sol,
        txSignature: sig, timestamp: Date.now(), privacyLinkId,
      };
      store.savePayment(record);
      if (privacyLinkId) store.markPrivacyLinkUsed(privacyLinkId, sig);
      setTxSig(sig);
      setStep('success');
    } catch (e: unknown) {
      setPayError(classifyError(e));
      setStep('error');
    }
  }

  const sol = parseFloat(amount);
  const isValidAmount = amount && !isNaN(sol) && sol > 0 && !amountError;

  const mergedCard = isSmall ? { ...card, ...cardSm } : card;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: isSmall ? 'center' : 'stretch', padding: isSmall ? '1rem' : 0 }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={step === 'confirm' ? undefined : onClose}
      />

      <div style={mergedCard}>
        {/* Drag handle — mobile */}
        {!isSmall && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px' }} />
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ color: '#fff', fontWeight: 500, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
            {step === 'success' ? 'Sent!' : step === 'error' ? (payError?.title ?? 'Error') : `Pay ${displayName}`}
          </h2>
          {step !== 'confirm' && (
            <button
              onClick={onClose}
              style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', fontSize: '1.375rem', cursor: 'pointer', lineHeight: 1, padding: '0.25rem' }}
            >
              ×
            </button>
          )}
        </div>

        {/* ── Amount step ── */}
        {step === 'amount' && (
          <>
            {!publicKey ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', textAlign: 'center', fontWeight: 300 }}>Connect your wallet to pay</p>
                {mounted && (
                  <WalletMultiButton style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '12px', color: '#ffffff', fontSize: '14px', fontWeight: '400',
                    height: '50px', width: '100%', justifyContent: 'center',
                  }} />
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Amount (SOL)</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                    Balance:{' '}
                    {balanceLoading
                      ? <span style={{ color: 'rgba(255,255,255,0.2)' }}>loading…</span>
                      : balance !== null
                        ? <span style={{ color: balance < 0.001 ? '#f87171' : 'rgba(255,255,255,0.5)' }}>{balance.toFixed(4)} SOL</span>
                        : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                    }
                  </span>
                </div>

                {/* Input */}
                <div>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.001"
                    inputMode="decimal"
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${amountError ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '12px',
                      padding: '0.875rem 1rem',
                      color: '#ffffff',
                      fontSize: '1.375rem',
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {amountError && <p style={{ marginTop: '0.375rem', color: '#f87171', fontSize: '0.75rem', lineHeight: 1.4 }}>{amountError}</p>}
                </div>

                {/* Low balance warning */}
                {balance !== null && balance < 0.001 && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '0.625rem 0.875rem' }}>
                    <span style={{ color: '#fbbf24' }}>⚠</span>
                    <p style={{ color: 'rgba(251,191,36,0.85)', fontSize: '0.75rem', lineHeight: 1.4 }}>Your balance is very low. Add SOL before sending.</p>
                  </div>
                )}

                {/* Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {presets.map(p => {
                    const tooLarge = balance !== null && p + TX_FEE_BUFFER > balance;
                    return (
                      <button
                        key={p}
                        onClick={() => handleAmountChange(String(p))}
                        disabled={tooLarge}
                        style={{
                          fontFamily: 'var(--font-inter)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '0.375rem 0',
                          fontSize: '0.75rem',
                          color: tooLarge ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                          cursor: tooLarge ? 'not-allowed' : 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Max */}
                {balance !== null && balance > TX_FEE_BUFFER && (
                  <button
                    onClick={() => handleAmountChange((balance - TX_FEE_BUFFER).toFixed(5))}
                    style={{ fontFamily: 'var(--font-inter)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem 0' }}
                  >
                    Send max ({(balance - TX_FEE_BUFFER).toFixed(5)} SOL)
                  </button>
                )}

                {/* Primary CTA */}
                <button
                  onClick={handlePay}
                  disabled={!isValidAmount}
                  style={{
                    fontFamily: 'var(--font-inter)',
                    background: isValidAmount ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    color: isValidAmount ? '#000000' : 'rgba(255,255,255,0.3)',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    padding: '0.9375rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: isValidAmount ? 'pointer' : 'not-allowed',
                    width: '100%',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  Send {amount && !isNaN(sol) && sol > 0 ? `${sol} SOL` : ''}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Confirming ── */}
        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
            <div style={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: 500 }}>Waiting for approval</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', fontWeight: 300, marginTop: '0.25rem' }}>Check your wallet and approve the transaction</p>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem', padding: '0.5rem 0' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 28, height: 28, color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 500, fontSize: '1.0625rem' }}>{amount} SOL sent</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 300, marginTop: '0.25rem' }}>to {displayName}</p>
              </div>
            </div>

            <a
              href={explorerUrl(txSig)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
            >
              View on Explorer
              <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 300, marginBottom: '0.25rem' }}>Want to get paid like this?</p>
              <a href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                Claim your aero link
              </a>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {step === 'error' && payError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem', padding: '0.5rem 0' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 28, height: 28, color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={payError.canRetry ? 'M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z' : 'M6 18L18 6M6 6l12 12'} />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 500 }}>{payError.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 300, marginTop: '0.25rem', lineHeight: 1.5 }}>{payError.detail}</p>
              </div>
            </div>

            {payError.canRetry && (
              <button
                onClick={() => { setStep('amount'); setPayError(null); }}
                style={{ fontFamily: 'var(--font-inter)', background: '#ffffff', color: '#000000', fontWeight: 500, fontSize: '0.9375rem', padding: '0.9375rem', borderRadius: '12px', border: 'none', cursor: 'pointer', width: '100%' }}
              >
                {payError.action ?? 'Try again'}
              </button>
            )}

            <button
              onClick={onClose}
              style={{ fontFamily: 'var(--font-inter)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 300, cursor: 'pointer', width: '100%' }}
            >
              {payError.canRetry ? 'Cancel' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
