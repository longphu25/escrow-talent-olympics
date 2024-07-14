
    'use client';


import { useWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { useEscrowProgram } from './escrow-data-access';
import { EscrowProgram, EscrowList } from './escrow-ui';
import { EscrowAirdropAndCreateMints } from './escrowAirdropAndCreateMints';

export default function EscrowFeature() {
  const { publicKey } = useWallet();
  const { programId } = useEscrowProgram();

  return publicKey ? (
    <div>
      <div className="container mx-auto py-10">
        <AppHero title="Escrow" subtitle={'Run the program by clicking the "Run program" button.'}>
          <p className="mb-6">
            <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
          </p>
        </AppHero>
        <EscrowAirdropAndCreateMints />
      </div>
      <div className="container mx-auto py-10">
        <EscrowList />
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
