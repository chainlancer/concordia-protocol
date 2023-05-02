"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./consts");
const config = {
    sepolia: {
        chainlinkTokenAddress: consts_1.CHAINLINK_TOKEN_ADDRESS_SEPOLIA,
        chainlinkNodeAddress: consts_1.CHAINLINK_NODE_ADDRESS_SEPOLIA,
        chainlinkOperatorAddress: consts_1.CHAINLINK_OPERATOR_ADDRESS_SEPOLIA,
        chainlinkJobID: consts_1.CHAINLINK_JOB_ID_SEPOLIA,
        chainlancerAddress: consts_1.CHAINLANCER_ADDRESS_SEPOLIA,
    },
};
exports.default = config;
