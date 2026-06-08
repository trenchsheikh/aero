'use client';

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

const PROFILES_KEY = 'aero_profiles';
const PRIVACY_LINKS_KEY = 'aero_privacy_links';
const PAYMENTS_KEY = 'aero_payments';
const MY_USERNAME_KEY = 'aero_my_username';

function getStore<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function setStore<T>(key: string, data: Record<string, T>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  saveProfile(profile: AeroProfile) {
    const profiles = getStore<AeroProfile>(PROFILES_KEY);
    profiles[profile.username.toLowerCase()] = profile;
    setStore(PROFILES_KEY, profiles);
    localStorage.setItem(MY_USERNAME_KEY, profile.username.toLowerCase());
  },

  getProfile(username: string): AeroProfile | null {
    const profiles = getStore<AeroProfile>(PROFILES_KEY);
    return profiles[username.toLowerCase()] ?? null;
  },

  getProfileByWallet(walletAddress: string): AeroProfile | null {
    const profiles = getStore<AeroProfile>(PROFILES_KEY);
    return Object.values(profiles).find(p => p.walletAddress === walletAddress) ?? null;
  },

  getMyUsername(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(MY_USERNAME_KEY);
  },

  usernameAvailable(username: string): boolean {
    const profiles = getStore<AeroProfile>(PROFILES_KEY);
    return !profiles[username.toLowerCase()];
  },

  savePrivacyLink(link: PrivacyLink) {
    const links = getStore<PrivacyLink>(PRIVACY_LINKS_KEY);
    links[link.id] = link;
    setStore(PRIVACY_LINKS_KEY, links);
  },

  getPrivacyLink(id: string): PrivacyLink | null {
    const links = getStore<PrivacyLink>(PRIVACY_LINKS_KEY);
    return links[id] ?? null;
  },

  markPrivacyLinkUsed(id: string, txSignature: string) {
    const links = getStore<PrivacyLink>(PRIVACY_LINKS_KEY);
    if (links[id]) {
      links[id].used = true;
      links[id].txSignature = txSignature;
      setStore(PRIVACY_LINKS_KEY, links);
    }
  },

  getMyPrivacyLinks(walletAddress: string): PrivacyLink[] {
    const links = getStore<PrivacyLink>(PRIVACY_LINKS_KEY);
    return Object.values(links).filter(l => l.ownerWallet === walletAddress);
  },

  savePayment(payment: PaymentRecord) {
    const payments = getStore<PaymentRecord>(PAYMENTS_KEY);
    payments[payment.id] = payment;
    setStore(PAYMENTS_KEY, payments);
  },

  getPaymentsReceived(walletAddress: string): PaymentRecord[] {
    const payments = getStore<PaymentRecord>(PAYMENTS_KEY);
    return Object.values(payments)
      .filter(p => p.recipientWallet === walletAddress)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
};
