
    'use client';


import { getEscrowProgram,getEscrowProgramId,  } from '@escrow-ui/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  // Program,
  BN
} from "@coral-xyz/anchor";
import {
  Cluster,
  // Keypair,
  // LAMPORTS_PER_SOL,
  PublicKey,
  // SystemProgram,
  // Transaction,
} from "@solana/web3.js";
import {
  // MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  // createAssociatedTokenAccountIdempotentInstruction,
  // createInitializeMint2Instruction,
  // createMintToInstruction,
  getAssociatedTokenAddressSync,
  // getMinimumBalanceForRentExemptMint,
  getMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";
import {
  useMutation,
  useQuery,
  // useQueryClient
} from '@tanstack/react-query';
import { useMemo } from 'react';
// import toast from 'react-hot-toast';
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

  const isToken2022 = async (mint: PublicKey) => {
    const mintInfo = await provider.connection.getAccountInfo(mint);
    return mintInfo?.owner.equals(TOKEN_2022_PROGRAM_ID);
  };

  const getMintInfo = async (mint: PublicKey) => {
    const tokenProgram = (await isToken2022(mint))
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

    return getMint(provider.connection, mint, undefined, tokenProgram);
  };

  const getEscrowInfo = async (escrow: PublicKey) => {
    return program.account.escrow.fetch(escrow);
  };

  const accounts = useQuery({
    queryKey: ['get-escrow-accounts'],
    queryFn: () => program.account.escrow.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const makeEscrow = useMutation({
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
      const tokenProgram = (await isToken2022(new PublicKey(mint_a)))
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID;

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

      const mintAInfo = await getMintInfo(new PublicKey(mint_a));
      const mintAAmount = new BN(deposit).mul(
        new BN(10).pow(new BN(mintAInfo.decimals))
      );
      const mintBInfo = await getMintInfo(new PublicKey(mint_b));
      const mintBAmount = new BN(receive).mul(
        new BN(10).pow(new BN(mintBInfo.decimals))
      );

      return program.methods
        .make(seed, mintAAmount, mintBAmount)
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

  const takeEscrow = useMutation({
    mutationKey: ["take-escrow"],
    mutationFn: async (params: { escrow: PublicKey }) => {
      if (!publicKey) return;
      const { escrow } = params;
      const escrowAccount = await getEscrowInfo(escrow);
      const tokenProgram = (await isToken2022(escrowAccount.mintA))
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID;
      const vault = getAssociatedTokenAddressSync(
        new PublicKey(escrowAccount.mintA),
        escrow,
        true,
        tokenProgram
      );

      const makerAtaB = getAssociatedTokenAddressSync(
        new PublicKey(escrowAccount.mintB),
        escrowAccount.maker,
        false,
        tokenProgram
      );

      const takerAtaA = getAssociatedTokenAddressSync(
        new PublicKey(escrowAccount.mintA),
        publicKey,
        false,
        tokenProgram
      );

      const takerAtaB = getAssociatedTokenAddressSync(
        new PublicKey(escrowAccount.mintB),
        publicKey,
        false,
        tokenProgram
      );

      return program.methods
        .take()
        .accountsPartial({
          maker: escrowAccount.maker,
          taker: publicKey,
          mintA: new PublicKey(escrowAccount.mintA),
          mintB: new PublicKey(escrowAccount.mintB),
          makerAtaB,
          takerAtaA,
          takerAtaB,
          escrow,
          tokenProgram,
          vault,
        })
        .rpc();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const refundEscrow = useMutation({
    mutationKey: ["refund-escrow"],
    mutationFn: async (params: { escrow: PublicKey }) => {
      if (!publicKey) return;

      const { escrow } = params;
      const escrowAccount = await getEscrowInfo(escrow);

      const tokenProgram = (await isToken2022(escrowAccount.mintA))
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID;

      const makerAtaA = getAssociatedTokenAddressSync(
        new PublicKey(escrowAccount.mintA),
        escrowAccount.maker,
        false,
        tokenProgram
      );

      const vault = getAssociatedTokenAddressSync(
        new PublicKey(escrowAccount.mintA),
        escrow,
        true,
        tokenProgram
      );

      return program.methods
        .refund()
        .accountsPartial({
          maker: escrowAccount.maker,
          mintA: new PublicKey(escrowAccount.mintA),
          vault,
          makerAtaA,
          escrow,
          tokenProgram,
        })
        .rpc();
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    getMintInfo,
    makeEscrow,
    takeEscrow,
    refundEscrow,
  };
}

export function useEscrowProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useEscrowProgram()

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.escrow.fetch(account),
  })

  return {
    accountQuery,
  }
}
