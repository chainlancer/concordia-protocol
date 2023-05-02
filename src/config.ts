import {
  CHAINLANCER_ADDRESS_SEPOLIA,
  CHAINLINK_JOB_ID_SEPOLIA,
  CHAINLINK_NODE_ADDRESS_SEPOLIA,
  CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
  CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
} from "./consts";

const config: Record<string, Record<string, string>> = {
  sepolia: {
    chainlinkTokenAddress: CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
    chainlinkNodeAddress: CHAINLINK_NODE_ADDRESS_SEPOLIA,
    chainlinkOperatorAddress: CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
    chainlinkJobID: CHAINLINK_JOB_ID_SEPOLIA,
    chainlancerAddress: CHAINLANCER_ADDRESS_SEPOLIA,
  },
};

export default config;
