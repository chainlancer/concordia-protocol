import config from "../../config";
import { ethers } from "ethers";

// todo
export function getDefaultSigner() {
  const provider = new ethers.providers.JsonRpcProvider(
    config["sepolia"].providerURL
  );
  return new ethers.Wallet(config["sepolia"].privateKey, provider);
}
