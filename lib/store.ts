'use client';

import { supabase } from './supabase';

export interface AeroProfile {
  username: string;
  displayName: string;
  bio: string;
  walletAddress: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface PrivacyLink {
  id: string;
  ownerWallet: string;
  used: boolean;
  createdAt: number;
  txSignature?: string;
}

export interface PaymentRecord {
  id: string;
  recipientUsername?: string;
  recipientWallet: string;
  senderWallet: string;
  amountSol: number;
  txSignature: string;
  timestamp: number;
  privacyLinkId?: string;
}

// ── row mappers ──────────────────────────────────────────────────────────────

function rowToProfile(row: Record<string, unknown>): AeroProfile {
  return {
    username:     row.username      as string,
    displayName:  row.display_name  as string,
    bio:          (row.bio as string) ?? '',
    walletAddress: row.wallet_address as string,
    avatarUrl:    row.avatar_url    as string | undefined,
    createdAt:    row.created_at    as number,
  };
}

function rowToPrivacyLink(row: Record<string, unknown>): PrivacyLink {
  return {
    id:          row.id           as string,
    ownerWallet: row.owner_wallet as string,
    used:        row.used         as boolean,
    createdAt:   row.created_at   as number,
    txSignature: row.tx_signature as string | undefined,
  };
}

function rowToPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    id:                row.id                 as string,
    recipientUsername: row.recipient_username  as string | undefined,
    recipientWallet:   row.recipient_wallet    as string,
    senderWallet:      row.sender_wallet       as string,
    amountSol:         Number(row.amount_sol),
    txSignature:       row.tx_signature        as string,
    timestamp:         row.timestamp           as number,
    privacyLinkId:     row.privacy_link_id     as string | undefined,
  };
}

// ── store ────────────────────────────────────────────────────────────────────

export const store = {
  async saveProfile(profile: AeroProfile): Promise<void> {
    await supabase.from('profiles').upsert({
      username:       profile.username.toLowerCase(),
      display_name:   profile.displayName,
      bio:            profile.bio,
      wallet_address: profile.walletAddress,
      avatar_url:     profile.avatarUrl ?? null,
      created_at:     profile.createdAt,
    });
  },

  async getProfile(username: string): Promise<AeroProfile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    return data ? rowToProfile(data) : null;
  },

  async getProfileByWallet(walletAddress: string): Promise<AeroProfile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();
    return data ? rowToProfile(data) : null;
  },

  async usernameAvailable(username: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    return data === null;
  },

  async savePrivacyLink(link: PrivacyLink): Promise<void> {
    await supabase.from('privacy_links').insert({
      id:           link.id,
      owner_wallet: link.ownerWallet,
      used:         link.used,
      created_at:   link.createdAt,
      tx_signature: link.txSignature ?? null,
    });
  },

  async getPrivacyLink(id: string): Promise<PrivacyLink | null> {
    const { data } = await supabase
      .from('privacy_links')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return data ? rowToPrivacyLink(data) : null;
  },

  async markPrivacyLinkUsed(id: string, txSignature: string): Promise<void> {
    await supabase
      .from('privacy_links')
      .update({ used: true, tx_signature: txSignature })
      .eq('id', id);
  },

  async getMyPrivacyLinks(walletAddress: string): Promise<PrivacyLink[]> {
    const { data } = await supabase
      .from('privacy_links')
      .select('*')
      .eq('owner_wallet', walletAddress)
      .order('created_at', { ascending: false });
    return (data ?? []).map(rowToPrivacyLink);
  },

  async savePayment(payment: PaymentRecord): Promise<void> {
    await supabase.from('payments').insert({
      id:                 payment.id,
      recipient_username: payment.recipientUsername ?? null,
      recipient_wallet:   payment.recipientWallet,
      sender_wallet:      payment.senderWallet,
      amount_sol:         payment.amountSol,
      tx_signature:       payment.txSignature,
      timestamp:          payment.timestamp,
      privacy_link_id:    payment.privacyLinkId ?? null,
    });
  },

  async getPaymentsReceived(walletAddress: string): Promise<PaymentRecord[]> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('recipient_wallet', walletAddress)
      .order('timestamp', { ascending: false });
    return (data ?? []).map(rowToPayment);
  },
};
