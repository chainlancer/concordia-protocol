const config: any = {
  ipfs: {
    host: process.env.IPFS_HOST,
    apiKey: process.env.IPFS_API_KEY,
  },
  sepolia: {
    providerURL: process.env.SEPOLIA_URL,
    chainlinkTokenAddress: process.env.CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
    chainlinkNodeAddress: process.env.CHAINLINK_NODE_ADDRESS_SEPOLIA,
    chainlinkOperatorAddress: process.env.CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
    chainlinkJobID: process.env.CHAINLINK_JOB_ID_SEPOLIA,
    concordiaAddress: process.env.CONCORDIA_ADDRESS_SEPOLIA,
    concordiaPublicKey: process.env.CONCORDIA_PUBLIC_KEY_SEPOLIA,
    concordiaPrivateKey: process.env.CONCORDIA_PRIVATE_KEY_SEPOLIA,
  },
};

export default config;
