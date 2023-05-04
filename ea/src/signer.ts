import config from "../../config";
import { Provider, ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

// todo
export function getDefaultSigner() {
  const provider = new JsonRpcProvider(config["sepolia"].providerURL);
  return new Wallet(config["sepolia"].privateKey, provider);
}
