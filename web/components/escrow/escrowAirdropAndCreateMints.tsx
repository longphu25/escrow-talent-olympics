
'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { useEscrowProgram } from './escrow-data-access';

export const EscrowAirdropAndCreateMints = () => {

  const { publicKey } = useWallet();
  const [makerAddress, setMakerAddress] = useState('');
  const [takerAddress, setTakerAddress] = useState('');
  const [mintA, setMintA] = useState(0.01);
  const [mintB, setMintB] = useState(0.01);
  const [submitted, setSubmitted] = useState(false);

  const { getProgramAccount, accounts, makeNewEscrow } = useEscrowProgram();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    makeNewEscrow.mutateAsync({
      mint_a: makerAddress,
      mint_b: takerAddress,
      deposit: mintA,
      receive: mintB,
    }).then(() => setSubmitted(true));
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Escrow Airdrop and Create Mints</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="makerAddress" className="block font-medium mb-1">
            Address Token - Maker
            </label>
            <input
              type="text"
              id="makerAddress"
              value={makerAddress}
              onChange={(e) => setMakerAddress(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mintA" className="block font-medium mb-1">
            Amout Token Maker
            </label>
            <input
              type="text"
              id="mintA"
              value={mintA}
              onChange={(e) => setMintA(parseFloat(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="takerAddress" className="block font-medium mb-1">
              Address Token - Taker
            </label>
            <input
              type="text"
              id="takerAddress"
              value={takerAddress}
              onChange={(e) => setTakerAddress(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="mintB" className="block font-medium mb-1">
              Amout Token Taker
            </label>
            <input
              type="text"
              id="mintB"
              value={mintB}
              onChange={(e) => setMintB(parseFloat(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
        {submitted && (
          <div className="mt-4">
            <p>Address Token - Maker: {makerAddress} - Deposit : {mintA}</p>
            <p>Address Token - Taker: {takerAddress} - Receive : {mintB}</p>
          </div>
        )}
      </div>
      {/* <div className={'space-y-6'}>
        {getProgramAccount.data && (
          <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
        )}
      </div>
      <div className={'space-y-6'}>
        {accounts  && (
          <pre>{JSON.stringify(accounts, null, 2)}</pre>
        )}
      </div> */}
    </div>
  );
};

export default EscrowAirdropAndCreateMints;
