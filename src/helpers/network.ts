import { StellarWalletsKit } from "stellar-wallets-kit";

export interface NetworkDetails {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
}

export const TESTNET_DETAILS = {
  network: "TESTNET",
  networkUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm/",
  networkPassphrase: "Test SDF Network ; September 2015",
};

export const MAINNET_DETAILS = {
  network: "MAINNET",
  networkUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm/",
  networkPassphrase: "Public Global Stellar Network ; September 2015",
};

export const signTx = async (
  xdr: string,
  publicKey: string,
  kit: StellarWalletsKit,
) => {
  const { signedXDR } = await kit.sign({
    xdr,
    publicKey,
  });
  return signedXDR;
};
