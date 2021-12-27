import * as React from "react";
import * as Dapp from "@elrondnetwork/dapp";
import BigNumber from "bignumber.js";
import {
  Account,
  Address,
  AddressValue,
  BigUIntValue,
  BytesValue,
  ContractFunction,
  GasLimit,
  Query,
  SmartContract,
} from "@elrondnetwork/erdjs";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { contractAddress } from "config";
import { RawTransactionType } from "helpers/types";
import useNewTransaction from "pages/Transaction/useNewTransaction";
import { routeNames } from "routes";
import { assignRoles, createNFT, createSigner, getProvider, issueNft, makeTransactions, prepareUserAccount, prepareUserSigner, syncProviderConfig, TestJson } from "helpers/transactions";

import jssonDataImport from "../../../assets/json/testJsonFile.json";
import walletFile from "../../../assets/wallet/wallet.json";

const Actions = () => {
  const sendTransaction = Dapp.useSendTransaction();
  const { address, dapp } = Dapp.useContext();
  const newTransaction = useNewTransaction();
  const [secondsLeft, setSecondsLeft] = React.useState<number>();
  const [hasPing, setHasPing] = React.useState<boolean>();

  const [ipfsImageUri] = React.useState("https://picsum.photos/id/237/200/300");
  const [tokenIdentifier] = React.useState("TONHA-156ef6");
  const [attributes] = React.useState("");
  const [nftName] = React.useState("TonhaTest103");

  const mount = () => {
    if (secondsLeft) {
      const interval = setInterval(() => {
        setSecondsLeft((existing) => {
          if (existing) {
            return existing - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(mount, [hasPing]);

  React.useEffect(() => {
    const query = new Query({
      address: new Address(contractAddress),
      func: new ContractFunction("getTimeToPong"),
      args: [new AddressValue(new Address(address))],
    });
    dapp.proxy
      .queryContract(query)
      .then(({ returnData }) => {
        const [encoded] = returnData;
        switch (encoded) {
          case undefined:
            setHasPing(true);
            break;
          case "":
            setSecondsLeft(0);
            setHasPing(false);
            break;
          default: {
            const decoded = Buffer.from(encoded, "base64").toString("hex");
            setSecondsLeft(parseInt(decoded, 16));
            setHasPing(false);
            break;
          }
        }
      })
      .catch((err) => {
        console.error("Unable to call VM query", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (transaction: RawTransactionType) => (e: React.MouseEvent) => {
    e.preventDefault();
    sendTransaction({
      transaction: newTransaction(transaction),
      callbackRoute: routeNames.transaction,
    });
  };


  const issueToken = (e: React.MouseEvent) => {
    e.preventDefault();

    const tx = issueNft({
      tokenName: "tonhaCollection",
      tokenTicker: "TONHA",
    });

    sendTransaction({
      transaction: tx,
      callbackRoute: routeNames.transaction,
    });
  };

  const setLocalRoles = (e: React.MouseEvent) => {
    e.preventDefault();

    const tx = assignRoles({
      tokenIdentifier,
      senderAddress: address,
    });

    sendTransaction({
      transaction: tx,
      callbackRoute: routeNames.transaction,
    });
  };


  const myNfts: TestJson[] = jssonDataImport;

  const createNFTToken = (e: React.MouseEvent) => {
    e.preventDefault();

    for (let i = 0; i < myNfts.length; i++) {
      const tx = createNFT({
        senderAddress: address,
        tokenIdentifier,
        nftName: myNfts[i].nftName,
        uri: myNfts[i].uri,
        attributes: myNfts[i].attributes,
      });

      sendTransaction({
        transaction: tx,
        callbackRoute: routeNames.transaction,
      });
    }
  };


  const mintLoop = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Provider type based on initial configuration
    const wallet = createSigner("../../../assets/wallet/wallet.json", "Ton@4155");

    // Smart contract instance - SC responsible for minting
    //   const smartContract = getSmartContract();

    // Provider type based on initial configuration
    const provider = getProvider();
    await syncProviderConfig(provider);

    const userAccount = new Account(new Address("erd1zr4jv6agtrl4c43qd7p9nd4mf37xfzhpa0p4xz9uuajpegcq4t2qg4ch5k"));
    await userAccount.sync(provider);

    const signer = createSigner("../../../assets/wallet/wallet.json", "Ton@4155");


    await makeTransactions(
      userAccount,
      provider,
      signer,
    );

  };

  return (
    <div className="d-flex mt-4 justify-content-center">

      <div className="action-btn" onClick={mintLoop}>
        <button className="btn">
          <FontAwesomeIcon icon={faArrowUp} className="text-primary" />
        </button>
        <a href="/" className="text-white text-decoration-none">
          Create NFT
        </a>
      </div>
    </div>
  );
};

export default Actions;
