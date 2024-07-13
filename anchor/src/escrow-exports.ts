// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import type { AnchorEscrow } from '../target/types/anchor_escrow';
import EscrowIDL from '../target/idl/anchor_escrow.json';

// Re-export the generated IDL and type
export { AnchorEscrow, EscrowIDL };

// The programId is imported from the program IDL.
export const ESCROW_PROGRAM_ID = new PublicKey(EscrowIDL.address)

// This is a helper function to get the Escrow Anchor program.
export function getEscrowProgram(provider: AnchorProvider) {
  return new Program(EscrowIDL as AnchorEscrow, provider);
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getEscrowProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return ESCROW_PROGRAM_ID
  }
}
