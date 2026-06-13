# Aero

**Your payment identity. Get paid by anyone.**

Aero is a Solana-native payment identity platform. Claim a personal handle — `aero.me/yourname` — and share one link. Anyone can pay you instantly from any Solana wallet. No addresses, no chain selection, no friction.

---

## Features

- **Payment profiles** — Claim your handle and get a public payment page at `/yourname`
- **Universal payment link** — Anyone pays your link with any Solana wallet. No Aero account required to send
- **Privacy links** — Generate one-time anonymous URLs that expire after a single payment
- **Non-custodial** — Funds go directly wallet-to-wallet via Solana `SystemProgram.transfer`. Aero never holds funds
- **On-chain verified** — Every transaction is publicly verifiable on Solana explorer
- **Sub-second settlement** — Payments confirm in under a second on Solana mainnet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Blockchain | Solana Mainnet (`@solana/web3.js`) |
| Wallet | `@solana/wallet-adapter-react` (Phantom, Solflare, Torus) |
| Font | Inter (300–600) |
| Storage | `localStorage` (client-side, no backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet browser extension (Phantom recommended)

### Install

```bash
git clone https://github.com/trenchsheikh/aero
cd aero
npm install
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Visit the app and connect your Solana wallet
2. Claim a username — this becomes your payment identity at `aero.me/yourname`
3. Share your link — anyone can visit it and send you SOL instantly
4. Generate privacy links from your dashboard for anonymous one-time payments

---

## Project Structure

```
app/
  page.tsx              # Landing page — claim username, hero CTAs
  [username]/page.tsx   # Public payment profile page
  dashboard/page.tsx    # User dashboard — stats, privacy links, history
  p/[id]/page.tsx       # One-time privacy link payment page
components/
  Navbar.tsx            # Floating liquid-glass navigation
  Footer.tsx            # Site footer with links
  PaymentModal.tsx      # Payment checkout modal with error handling
  WalletProvider.tsx    # Solana wallet adapter context
  blocks/
    features-8.tsx      # Bento-grid feature section
  ui/
    card.tsx            # shadcn Card component
    button.tsx          # shadcn Button component
lib/
  solana.ts             # Connection, transfer builder, explorer URL
  store.ts              # localStorage store for profiles and payments
  utils.ts              # shadcn cn() utility
```

---

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

---

## Social

- X / Twitter: [@UseAero](https://x.com/useaero)
