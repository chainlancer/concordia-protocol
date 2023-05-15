// SPDX-License-Identifier: MIT

/// Contract to test checksum calculation and keccak256 hashing mechanisms in solidity.
/// NOT TO BE USED IN PRODUCTION

pragma solidity ^0.8.7;

contract Checksum {
    function checksum(
        bytes32 _deliverableHash,
        bytes memory _key
    ) public pure returns (bytes32 result) {
        bytes32 keyHash = keccak256(_key);
        bytes32 _checksum = keccak256(
            abi.encodePacked(_deliverableHash, keyHash)
        );
        return _checksum;
    }

    function pack(
        bytes32 _deliverableHash,
        bytes memory _key
    ) public pure returns (bytes memory result) {
        bytes32 keyHash = keccak256(_key);
        return abi.encodePacked(_deliverableHash, keyHash);
    }

    function keccak(bytes memory _b) public pure returns (bytes32 result) {
        bytes32 bHash = keccak256(_b);
        return bHash;
    }
}
