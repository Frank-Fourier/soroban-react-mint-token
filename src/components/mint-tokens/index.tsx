import React from "react";
import { createPortal } from "react-dom";
import {
  Card,
  Caption,
  Layout,
  Notification,
  Profile,
  Loader,
} from "@stellar/design-system";
import {
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
  ISupportedWallet,
} from "stellar-wallets-kit";
import { Contract, TimeoutInfinite, TransactionBuilder } from "@stellar/stellar-sdk";
import { ethers } from "ethers";

import { stroopToXlm } from "../../helpers/format";
import { MAINNET_DETAILS } from "../../helpers/network";
import { ERRORS } from "../../helpers/error";
import {
  getEstimatedFee,
  getTxBuilder,
  BASE_FEE,
  XLM_DECIMALS,
  getServer,
  submitTx,
  simulateTx,
  accountToScVal,
} from "../../helpers/soroban";

import { TxResult } from "./tx-result";
import { SubmitToken } from "./token-submit";
import { ConfirmMintTx } from "./token-confirmation";
import { TokenTransaction } from "./token-transaction";
import { TokenQuantity } from "./token-quantity";
import { TokenDest } from "./token-destination";
import { ConnectWallet } from "./connect-wallet";
import { Pool } from "../../constants/poolOptions";

import "./index.scss";

type StepCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface MintTokenProps {
  hasHeader?: boolean;
}

export const MintToken = (props: MintTokenProps) => {
  // This is only needed when this component is consumed by other components that display a different header
  const hasHeader = props.hasHeader === undefined ? true : props.hasHeader;

  // Default to Testnet network
  const [selectedNetwork] = React.useState(MAINNET_DETAILS);

  // Initial state, empty states for token/transaction details
  const [activePubKey, setActivePubKey] = React.useState(null as string | null);
  const [stepCount, setStepCount] = React.useState(1 as StepCount);
  const [connectionError, setConnectionError] = React.useState(
    null as string | null,
  );

  const [fee, setFee] = React.useState(BASE_FEE);
  const [memo, setMemo] = React.useState("");
  const [tokenDecimals, setTokenDecimals] = React.useState(XLM_DECIMALS);
  // const [pool, setPool] = React.useState({} as Pool);
  const [vaultId, setVaultId] = React.useState("");
  const [tokenSymbol, setTokenSymbol] = React.useState("");
  const [TVL, setTVL] = React.useState("");
  const [tokenBalance, setTokenBalance] = React.useState("");
  /*
  const [shareDecimals, setShareDecimals] = React.useState(XLM_DECIMALS);
  const [shareId, setShareId] = React.useState("");
  const [shareSymbol, setShareSymbol] = React.useState("");
  */
  const [quantity, setQuantity] = React.useState("");
  const [txResultXDR, setTxResultXDR] = React.useState("");
  const [signedXdr, setSignedXdr] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // 2 basic loading states for now
  const [isLoadingTokenDetails, setIsLoadingTokenDetails] =
    React.useState<boolean>(false);
  const [isGettingFee, setIsGettingFee] = React.useState(false);

  // Setup swc, user will set the desired wallet on connect
  const [SWKKit] = React.useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    }),
  );

  // Whenever the selected network changes, set the network on swc
  React.useEffect(() => {
    SWKKit.setNetwork(selectedNetwork.networkPassphrase as WalletNetwork);
  }, [selectedNetwork.networkPassphrase, SWKKit]);

  // with a user provided token ID, fetch token details
  async function setVault(vault: Pool) {
    setIsLoadingTokenDetails(true);
    // setPool(vault);
    setVaultId(vault.address);
    setTokenSymbol(vault.tokenSymbol);
    setTokenDecimals(vault.tokenDecimals);
    /*
    setShareId(vault.shareId);
    setShareDecimals(vault.shareDecimals);
    setShareSymbol(vault.shareSymbol);
    */

    // get an instance of a Soroban RPC server for the selected network
    const server = getServer(selectedNetwork);

    try {
      // Right now, Soroban only supports operation per transaction
      // so we need to get a transaction builder for every operation we want to call.
      // In the future, we will be able to use more than 1 operation in a single transaction.

      const txBuilderReserves = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        selectedNetwork.networkPassphrase,
      );

      // Get the tokens name, decoded as a string
      const getRsrvs = async (
        id: string,
        txBuilder: TransactionBuilder,
        connection: any,
      ) => {
        console.log("id", id);
        const contract = new Contract(id);
        const tx = txBuilder
          .addOperation(contract.call("get_rsrvs"))
          .setTimeout(TimeoutInfinite)
          .build();

        const result = await simulateTx<string>(tx, connection);
        return ethers.formatUnits(result, vault.tokenDecimals);
      };

      // Get the symbol for the set token ID
      // https://github.com/stellar/soroban-examples/blob/main/token/src/contract.rs#L47
      const poolReserves = await getRsrvs(vault.address, txBuilderReserves, server);
      setTVL(poolReserves);
      console.log("poolReserves", poolReserves);
      
      const txBuilderBalance = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        selectedNetwork.networkPassphrase,
      );

      // Get the tokens name, decoded as a string
      const getTokenBalance = async (
        id: string,
        txBuilder: TransactionBuilder,
        connection: any,
        destinationPubKey: string | null = null,
      ) => {
        console.log("id", id);
        const contract = new Contract(id);
        if ( !destinationPubKey ) {
          console.log("destinationPubKey is null");
          return "0";
        }
        const tx = txBuilder
          .addOperation(
            contract.call(
              "balance",
              ...[
                accountToScVal(destinationPubKey) // id
              ],
            ),
          )
          .setTimeout(TimeoutInfinite)
          .build();

        const result = await simulateTx<string>(tx, connection);
        console.log("result", result);
        console.log("result.toString()", result.toString());
        return ethers.formatUnits(result, vault.tokenDecimals);
      }; 

      // Get the symbol for the set token ID
      // https://github.com/stellar/soroban-examples/blob/main/token/src/contract.rs#L47
      const tokenBalanceUser = await getTokenBalance(vault.tokenId, txBuilderBalance, server, activePubKey);
      setTokenBalance(tokenBalanceUser);
      console.log("tokenBalanceUser", tokenBalanceUser);

      return true;
    } catch (error) {
      console.log(error);
      setConnectionError("Unable to fetch token details.");

      return false;
    } finally {
      setIsLoadingTokenDetails(false);
    }
  }

  const getFee = async () => {
    setIsGettingFee(true);
    const server = getServer(selectedNetwork);

    try {
      const builder = await getTxBuilder(
        activePubKey!,
        fee,
        server,
        selectedNetwork.networkPassphrase,
      );

      const estimatedFee = await getEstimatedFee(
        vaultId,
        ethers.parseUnits(quantity, tokenDecimals).toString(),
        activePubKey!,
        memo,
        builder,
        server,
      );
      setFee(stroopToXlm(estimatedFee).toString());
      setIsGettingFee(false);
    } catch (error) {
      // defaults to hardcoded base fee if this fails
      console.log(error);
      setIsGettingFee(false);
    }
  };

  // This uses the StepCount tro render to currently active step in the payment flow
  function renderStep(step: StepCount) {
    switch (step) {
      case 7: {
        const onClick = () => setStepCount(1);
        return <TxResult onClick={onClick} resultXDR={txResultXDR} />;
      }
      case 6: {
        // Uses state saved from previous steps in order to submit a transaction to the network
        const submit = async () => {
          const server = getServer(selectedNetwork);

          setIsSubmitting(true);

          try {
            const result = await submitTx(
              signedXdr,
              selectedNetwork.networkPassphrase,
              server,
            );

            setTxResultXDR(result);
            setIsSubmitting(false);

            setStepCount((stepCount + 1) as StepCount);
          } catch (error) {
            console.log(error);
            setIsSubmitting(false);
            setConnectionError(ERRORS.UNABLE_TO_SUBMIT_TX);
          }
        };
        return (
          <SubmitToken
            network={selectedNetwork.network}
            quantity={quantity}
            tokenSymbol={tokenSymbol}
            fee={fee}
            signedXdr={signedXdr}
            isSubmitting={isSubmitting}
            memo={memo}
            onClick={submit}
          />
        );
      }
      case 5: {
        const setSignedTx = (xdr: string) => {
          setSignedXdr(xdr);
          setStepCount((stepCount + 1) as StepCount);
        };
        return (
          <ConfirmMintTx
            tokenId={vaultId}
            pubKey={activePubKey!}
            tokenSymbol={tokenSymbol}
            onTxSign={setSignedTx}
            destination={activePubKey!}
            quantity={quantity}
            fee={fee}
            memo={memo}
            networkDetails={selectedNetwork}
            tokenDecimals={tokenDecimals}
            kit={SWKKit}
            setError={setConnectionError}
          />
        );
      }
      case 4: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <TokenTransaction
            fee={fee}
            memo={memo}
            onClick={onClick}
            setFee={setFee}
            setMemo={setMemo}
          />
        );
      }
      case 3: {
        const onClick = async () => {
          // set estimated fee for next step
          await getFee();
          setStepCount((stepCount + 1) as StepCount);
        };

        if (isGettingFee) {
          return (
            <div className="loading">
              <Loader />
            </div>
          );
        }
        return (
          <TokenQuantity
            quantity={quantity}
            setQuantity={setQuantity}
            onClick={onClick}
            tokenSymbol={tokenSymbol}
            tokenBalance={tokenBalance}
            TVL={TVL}
          />
        );
      }
      case 2: {
        if (isLoadingTokenDetails) {
          return (
            <div className="loading">
              <Loader />
            </div>
          );
        }
        const onClick = async (vault: Pool) => {
          const success = await setVault(vault);

          if (success) {
            setStepCount((stepCount + 1) as StepCount);
          }
        };
        return (
          <TokenDest
            onClick={onClick}
          />
        );
      }
      case 1:
      default: {
        const onClick = async () => {
          setConnectionError(null);

          // See https://github.com/Creit-Tech/Stellar-Wallets-Kit/tree/main for more options
          if (!activePubKey) {
            await SWKKit.openModal({
              allowedWallets: [
                WalletType.ALBEDO,
                WalletType.FREIGHTER,
                WalletType.XBULL,
              ],
              onWalletSelected: async (option: ISupportedWallet) => {
                try {
                  // Set selected wallet,  network, and public key
                  SWKKit.setWallet(option.type);
                  const publicKey = await SWKKit.getPublicKey();

                  await SWKKit.setNetwork(WalletNetwork.PUBLIC);
                  setActivePubKey(publicKey);
                } catch (error) {
                  console.log(error);
                  setConnectionError(ERRORS.WALLET_CONNECTION_REJECTED);
                }
              },
            });
          } else {
            setStepCount((stepCount + 1) as StepCount);
          }
        };
        return (
          <ConnectWallet
            selectedNetwork={selectedNetwork.network}
            pubKey={activePubKey}
            onClick={onClick}
          />
        );
      }
    }
  }

  return (
    <>
      {hasHeader && (
        <Layout.Header hasThemeSwitch projectId="soroban-react-mint-token" />
      )}
      <div className="Layout__inset account-badge-row">
        {activePubKey !== null && (
          <Profile isShort publicAddress={activePubKey} size="sm" />
        )}
      </div>
      <div className="Layout__inset layout">
        <div className="mint-token">
          <Card variant="primary">
            <Caption size="sm" addlClassName="step-count">
              step {stepCount} of 7
            </Caption>
            {renderStep(stepCount)}
          </Card>
        </div>
        {connectionError !== null &&
          createPortal(
            <div className="notification-container">
              <Notification title={connectionError!} variant="error" />
            </div>,
            document.getElementById("root")!,
          )}
      </div>
    </>
  );
};
