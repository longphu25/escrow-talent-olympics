
'use client';

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { useEscrowProgram, useEscrowProgramAccount } from './escrow-data-access';
import { BN, ProgramAccount } from "@coral-xyz/anchor";

export function EscrowProgram() {
  const { getProgramAccount } = useEscrowProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  );
}

export function EscrowList() {
  const { accounts, getProgramAccount } = useEscrowProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 my-10 gap-8">
          {accounts.data?.map((escrow) => (
            <EscrowCard key={escrow.publicKey.toString()} data={escrow} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

type EscrowProps = {
  data: ProgramAccount<{
    seed: BN;
    maker: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    receive: BN;
    bump: number;
  }>;
};

const EscrowCard: React.FC<EscrowProps> = ({ data }: EscrowProps, { account }: { account: PublicKey }) => {
  const {
      accountQuery,
  } = useEscrowProgramAccount({ account })

  const { getMintInfo } = useEscrowProgram()

  const amount = useMemo(async () => {
    const amount = data.account.receive;
    const mintInfo = await getMintInfo(data.account.mintB);
    const decimals = mintInfo.decimals;
    return new BN(amount).div(new BN(10).pow(new BN(decimals || 0))).toString();
  }, [data.account.mintB, data.account.receive, getMintInfo]);

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm group cursor-pointer">
      <div className="card-body items-center text-center">
        <div className="space-y-6flex flex-col space-y-1.5 p-6">
          <h2 className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-between" onClick={() => accountQuery.refetch()}>
            Escrow
          </h2>
          <div className="card-actions justify-around">
          <span className="block">
            Seed:
            <span className="text-primary/70 ml-2">
              {ellipsify(data.account.seed.toString())}
            </span>
          </span>
          <span className="block">
            ID:
            <span className="text-primary/70 text-sm ml-2">
              {ellipsify(data.publicKey.toString(), 8)}
            </span>
          </span>
          <span className="block">
            Maker - User Address:
            <span className="text-primary/70 text-sm ml-2">
              {ellipsify(data.account.maker.toString(), 8)}
            </span>
          </span>

          <span className="block">
            Maker - Token Address:
            <span className="text-primary/70 text-sm ml-2">
              {ellipsify(data.account.mintA.toString(), 8)}
            </span>
          </span>

          <span className="block">
            Request - Token Address:
            <span className="text-primary/70 text-sm ml-2">
              {ellipsify(data.account.mintB.toString(), 8)}
            </span>
          </span>

          <span className="block">
            Amount:
            <span className="text-primary/70 text-sm ml-2">
              {amount}
            </span>
          </span>
          </div>
          <div className="text-center space-y-4">
          </div>
        </div>
      </div>
      {/* <div className={'space-y-6'}>
        {data && (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div> */}
    </div>
  )
}
