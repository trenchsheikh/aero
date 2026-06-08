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

  if (lower.includes('user rejected') || lower.includes('rejected the request') || lower.includes('cancelled') || lower.includes('canceled')) {
    return { title: 'Payment cancelled', detail: 'You declined the transaction in your wallet.', canRetry: true, action: 'Try again' };
  }
  if (lower.includes('insufficient') || lower.includes('0x1') || lower.includes('insufficient lamports') || lower.includes('not enough sol')) {
    return { title: 'Insufficient funds', detail: "Your wallet doesn't have enough SOL to cover this payment plus the network fee.", canRetry: true, action: 'Change amount' };
  }
  if (lower.includes('blockhash not found') || lower.includes('block height exceeded') || lower.includes('blockhash expired')) {
    return { title: 'Transaction expired', detail: 'The transaction took too long and expired. This can happen when the network is congested.', canRetry: true, action: 'Try again' };
  }
  if (lower.includes('already been processed') || lower.includes('already processed')) {
    return { title: 'Already sent', detail: 'This transaction was already processed — your funds were sent.', canRetry: false, action: 'Close' };
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('econnrefused') || lower.includes('timeout') || lower.includes('503') || lower.includes('429')) {
    return { title: 'Network error', detail: 'Could not reach the Solana network. Check your connection and try again.', canRetry: true, action: 'Try again' };
  }
  if (lower.includes('wallet not connected') || lower.includes('not connected')) {
    return { title: 'Wallet disconnected', detail: 'Your wallet disconnected during the transaction. Reconnect and try again.', canRetry: true, action: 'Try again' };
  }
  if (lower.includes('simulation failed') || lower.includes('0x0')) {
    return { title: 'Transaction failed', detail: 'Solana rejected the transaction during simulation. Your funds were not sent.', canRetry: true, action: 'Try again' };
  }
  return { title: 'Something went wrong', detail: raw.length < 120 ? raw : 'An unexpected error occurred. Your funds were not sent.', canRetry: true, action: 'Try again' };
}

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

  const presets = [0.01, 0.05, 0.1, 0.5];

  useEffect(() => { setMounted(true); }, []);

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
      return `Insufficient funds. Max you can send: ${max.toFixed(5)} SOL (keeping a small amount for fees)`;
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
        id: uuidv4(),
        recipientUsername,
        recipientWallet,
        senderWallet: publicKey.toBase58(),
        amountSol: sol,
        txSignature: sig,
        timestamp: Date.now(),
        privacyLinkId,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/15 backdrop-blur-sm" onClick={step === 'confirm' ? undefined : onClose} />
      <div className="relative bg-white border border-brand/20 rounded-2xl w-full max-w-sm p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-ink font-medium text-lg">
            {step === 'success' ? 'Sent!' : step === 'error' ? (payError?.title ?? 'Error') : `Pay ${displayName}`}
          </h2>
          {step !== 'confirm' && (
            <button onClick={onClose} className="text-ink-subtle hover:text-brand text-xl leading-none transition-colors">
              ×
            </button>
          )}
        </div>

        {/* Amount step */}
        {step === 'amount' && (
          <>
            {!publicKey ? (
              <div className="space-y-4">
                <p className="text-ink-muted text-sm text-center font-light">Connect your wallet to pay</p>
                {mounted && (
                  <WalletMultiButton
                    style={{
                      background: '#5BC0F0',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '400',
                      height: '44px',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Balance */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted font-light">Amount (SOL)</span>
                  <span className="text-ink-muted font-light">
                    Balance:{' '}
                    {balanceLoading
                      ? <span className="text-ink-subtle">loading...</span>
                      : balance !== null
                        ? <span className={balance < 0.001 ? 'text-red-500' : 'text-ink-muted'}>{balance.toFixed(4)} SOL</span>
                        : <span className="text-ink-subtle">—</span>
                    }
                  </span>
                </div>

                <div>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.001"
                    autoFocus
                    className={`w-full bg-brand/5 border rounded-xl px-4 py-3 text-ink text-xl font-mono focus:outline-none transition-colors ${
                      amountError ? 'border-red-400 focus:border-red-500' : 'border-brand/20 focus:border-brand/50'
                    }`}
                  />
                  {amountError && <p className="mt-1.5 text-red-500 text-xs leading-snug">{amountError}</p>}
                </div>

                {/* Low balance warning */}
                {balance !== null && balance < 0.001 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    <p className="text-amber-700 text-xs leading-snug">Your balance is very low. Please add SOL to your wallet before sending.</p>
                  </div>
                )}

                {/* Preset amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {presets.map(p => {
                    const tooLarge = balance !== null && p + TX_FEE_BUFFER > balance;
                    return (
                      <button
                        key={p}
                        onClick={() => handleAmountChange(String(p))}
                        disabled={tooLarge}
                        className={`border rounded-lg py-1.5 text-xs transition-all ${
                          tooLarge
                            ? 'bg-brand/3 border-brand/8 text-ink-subtle/40 cursor-not-allowed'
                            : 'bg-brand/8 hover:bg-brand/15 border-brand/20 text-brand hover:text-ink'
                        }`}
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
                    className="w-full text-xs text-ink-muted hover:text-brand transition-colors"
                  >
                    Send max ({(balance - TX_FEE_BUFFER).toFixed(5)} SOL)
                  </button>
                )}

                <button
                  onClick={handlePay}
                  disabled={!isValidAmount}
                  className="w-full bg-brand text-white font-medium rounded-xl py-3 hover:bg-brand/80 hover:shadow-[0_4px_16px_rgba(91,192,240,0.35)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Send {amount && !isNaN(sol) && sol > 0 ? `${sol} SOL` : ''}
                </button>
              </div>
            )}
          </>
        )}

        {/* Confirming */}
        {step === 'confirm' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-ink text-sm font-medium">Waiting for approval</p>
              <p className="text-ink-muted text-xs font-light">Check your wallet and approve the transaction</p>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-ink font-medium text-lg">{amount} SOL sent</p>
                <p className="text-ink-muted text-sm font-light">to {displayName}</p>
              </div>
            </div>

            <a
              href={explorerUrl(txSig)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-brand/8 hover:bg-brand/15 border border-brand/20 rounded-xl py-3 text-brand text-sm transition-all"
            >
              View on Explorer
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div className="bg-brand/5 border border-brand/15 rounded-xl p-3 text-center">
              <p className="text-ink-muted text-xs font-light">Want to get paid like this?</p>
              <a href="/" className="text-brand text-sm font-medium hover:underline">
                Claim your aero link →
              </a>
            </div>
          </div>
        )}

        {/* Error */}
        {step === 'error' && payError && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
                {payError.canRetry ? (
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-ink font-medium">{payError.title}</p>
                <p className="text-ink-muted text-sm leading-snug font-light">{payError.detail}</p>
              </div>
            </div>

            {payError.canRetry && (
              <button
                onClick={() => { setStep('amount'); setPayError(null); }}
                className="w-full bg-brand text-white font-medium rounded-xl py-3 hover:bg-brand/80 hover:shadow-[0_4px_16px_rgba(91,192,240,0.35)] transition-all text-sm"
              >
                {payError.action ?? 'Try again'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-brand/5 hover:bg-brand/10 border border-brand/15 rounded-xl py-2.5 text-ink-muted hover:text-ink text-sm font-light transition-all"
            >
              {payError.canRetry ? 'Cancel' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
