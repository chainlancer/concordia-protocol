"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    sepolia: {
        providerURL: process.env.SEPOLIA_URL,
        chainlinkTokenAddress: process.env.CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
        chainlinkNodeAddress: process.env.CHAINLINK_NODE_ADDRESS_SEPOLIA,
        chainlinkOperatorAddress: process.env.CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
        chainlinkJobID: process.env.CHAINLINK_JOB_ID_SEPOLIA,
        lancerAddress: process.env.LANCER_ADDRESS_SEPOLIA,
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map