import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';

export const NETWORK = 'mainnet-beta';
export const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export async function buildTransferTx(
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amountSol: number
): Promise<Transaction> {
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromPubkey;
  tx.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: solToLamports(amountSol),
    })
  );
  return tx;
}

export async function getBalance(walletAddress: string): Promise<number> {
  try {
    const pk = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(pk);
    return lamportsToSol(lamports);
  } catch {
    return 0;
  }
}

export function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
