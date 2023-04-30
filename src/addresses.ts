import {
  CHAINLANCER_ADDRESS_SEPOLIA,
  CHAINLINK_JOB_ID_SEPOLIA,
  CHAINLINK_NODE_ADDRESS_SEPOLIA,
  CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
  CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
} from "./consts";

const addresses: Record<string, Record<string, string>> = {
  sepolia: {
    chainlinkToken: CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
    chainlinkNode: CHAINLINK_NODE_ADDRESS_SEPOLIA,
    chainlinkOperator: CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
    chainlinkJobID: CHAINLINK_JOB_ID_SEPOLIA,
    chainlancer: CHAINLANCER_ADDRESS_SEPOLIA,
  },
};

export default addresses;
