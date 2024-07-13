
    'use client';


import { getEscrowProgram,getEscrowProgramId,  } from '@escrow-ui/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, BN } from "@coral-xyz/anchor";
import {
  Cluster,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  // TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useEscrowProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()

  const provider = useAnchorProvider()
  const programId = useMemo(
    () => getEscrowProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getEscrowProgram(provider)

  const { publicKey } = useWallet();
  const tokenProgram = TOKEN_2022_PROGRAM_ID;

  const accounts = useQuery({
    queryKey: ['get-escrow-accounts'],
    queryFn: () => program.account.escrow.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const makeNewEscrow = useMutation({
    mutationKey: ["make-new-escrow"],
    mutationFn: async (params: {
      mint_a: string;
      mint_b: string;
      deposit: number;
      receive: number;
    }) => {
      if (!publicKey) return;
      const seed = new BN(randomBytes(8));
      const { mint_a, mint_b, deposit, receive } = params;

      const makerAtaA = getAssociatedTokenAddressSync(
        new PublicKey(mint_a),
        publicKey,
        false,
        tokenProgram
      );

      const [escrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          publicKey.toBuffer(),
          seed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const vault = getAssociatedTokenAddressSync(
        new PublicKey(mint_a),
        escrow,
        true,
        tokenProgram
      );

      return program.methods
        .make(seed, new BN(deposit), new BN(receive))
        .accounts({
          maker: publicKey,
          mintA: new PublicKey(mint_a),
          mintB: new PublicKey(mint_b),
          makerAtaA,
          vault,
          tokenProgram,
        })
        .rpc();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    makeNewEscrow,
  };
}
