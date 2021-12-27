import {
    Transaction,
    GasLimit,
    Address,
    TransactionPayload,
    Balance,
    SmartContract,
    ContractFunction,
    BytesValue,
    BigIntValue,
    BigUIntValue,
    UserSigner,
    SystemConstants,
    NetworkConfig,
    Account,
    IProvider,
    ISigner,
    chooseProvider,
    ProxyProvider,
} from "@elrondnetwork/erdjs";
import { contractAddress } from "config";
import { stringToHex } from "./utils";
import jssonDataImport from "../../src/assets/json/testJsonFile.json";
import BigNumber from "bignumber.js";
import os from "os";
import * as fs from "fs";

export interface IssueNFTData {
    tokenName: string;
    tokenTicker: string;
}

export interface TestJson {
    nftName: string,
    uri: string,
    attributes: string
}


export interface AssignRolesData {
    tokenIdentifier: string;
    senderAddress: string;
}

export interface CreateNFTData {
    senderAddress: string;
    tokenIdentifier: string;
    nftName: string;
    uri: string;
    attributes?: string;
}

export const issueNft = (data: IssueNFTData) =>
    new Transaction({
        sender: new Address("erd1dzurql3men9v5h8kkvq9343q79wqszg95aw2fukjwvvu0wlsap7qj5flf7"),
        receiver: new Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
        value: Balance.egld("0.05"),
        data: new TransactionPayload(
            `issueNonFungible@${stringToHex(data.tokenName)}@${stringToHex(
                data.tokenTicker
            )}`
        ),
        gasLimit: new GasLimit(60000000),
    });

export const assignRoles = (data: AssignRolesData) =>
    new Transaction({
        sender: new Address("erd1dzurql3men9v5h8kkvq9343q79wqszg95aw2fukjwvvu0wlsap7qj5flf7"),
        receiver: new Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
        value: Balance.egld("0"),
        data: new TransactionPayload(
            `setSpecialRole@${stringToHex(data.tokenIdentifier)}@${new Address(
                data.senderAddress
            ).hex()}@45534454526f6c654e4654437265617465`
        ),
        gasLimit: new GasLimit(60000000),
    });


export const createNFT = (data: CreateNFTData) =>
    new Transaction({
        sender: new Address(data.senderAddress),
        receiver: new Address(data.senderAddress),
        value: Balance.egld("0"),
        data: new TransactionPayload(
            `ESDTNFTCreate@${stringToHex(data.tokenIdentifier)}@01@${stringToHex(
                data.nftName
            )}@00@@${stringToHex(data.attributes || "")}@${stringToHex(data.uri)}`
        ),
        gasLimit: new GasLimit(1036000),
    });



// Prepare user signer - we need to be able to sign transactions
// using JSON wallet file and password
// It can also be configured using a pem file, but for now, this will be enough
export const prepareUserSigner = (wallet: any, walletPassword: string) => {
    const signer = UserSigner.fromWallet(wallet, walletPassword);
    return signer;
};

export const getProvider = () => {
    return chooseProvider("elrond-devnet");
};

// Sync proper chain, for example, the devnet
export const syncProviderConfig = async (provider: IProvider) => {
    return NetworkConfig.getDefault().sync(provider);
};


// Prepare main user account from the address
export const prepareUserAccount = async (address: string) => {
    return new Account(new Address(address));
};

export const makeTransactions = async (
    userAccount: Account,
    provider: IProvider,
    signer: ISigner
) => {
    const myNfts: TestJson[] = jssonDataImport;

    const transaction = createNFT({
        senderAddress: "erd1zr4jv6agtrl4c43qd7p9nd4mf37xfzhpa0p4xz9uuajpegcq4t2qg4ch5k",
        tokenIdentifier: "",
        nftName: "NameTest",
        uri: "TechBased",
        attributes: "",
    });

    signer.sign(transaction);
    await transaction.send(provider);
    console.log(transaction);

};



export const createSigner = (keyFile: string, passwordFile: string) => {
    keyFile = asUserPath(keyFile);
    passwordFile = asUserPath(passwordFile);

    const keyFileJson = readText(keyFile);
    const keyFileObject = JSON.parse(keyFileJson);
    const password = readText(passwordFile);
    const signer = UserSigner.fromWallet(keyFileObject, password);
    return signer;
};


export const asUserPath = (userPath: string | undefined) => {
    return (userPath || "").replace("~", os.homedir);
};

export const readText = (filePath: string) => {
    return fs.readFileSync(filePath, { encoding: "utf8" }).trim();
};



