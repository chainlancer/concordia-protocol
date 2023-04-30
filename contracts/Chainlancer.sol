// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

// Encryption process:
//
// decryption key k
// client's wallet public key p
// work bundle w
// encrypted work bundle on IPFS W = k(w_p)
// SHA3-256 H
// work agreement checksum c = H(w_p)
//
// How it works:
// 1. proprietor uploads W to IPFS
// 2. after contract is paid in full, proprietor provides the contract with k
// 2.1. contract calls Chainlink EA to fetch W from IPFS
// 2.2. Chainlink EA unwraps W with k resulting in w_p
// 2.3. w_p is hashed H(w_p) and returned to the contract
// 2.4. contract compares c with H(w_p)
// 2.5. if true, key is accepted and the agreement is marked as "paid"
// 3. client can decrypt W with k and p to get w

contract Chainlancer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    struct WorkAgreement {
        bytes32 checksum;
        uint256 price;
        address payable proprietor;
        address payable client;
        address payable verifier;
        bool paid;
        bool verifierApproved;
        bytes decryptionKey;
        string ipfsCID;
    }

    mapping(uint256 => WorkAgreement) public workAgreements;
    uint256 public workAgreementCount;

    // todo: cleanup
    struct TempData {
        uint256 workAgreementId;
        bytes key;
    }

    // maps a Chainlink request ID to a tuple containing the work agreement ID and the decryption key. We chose to
    // use this mapping to store these associations, rather than passing these values through the external adapter, to
    // instill that the contract is the source of truth
    mapping(bytes32 => TempData) private requestIdToTempData;

    // Chainlink variables
    address private ORACLE;
    string private CHAINLINK_JOB;
    uint256 private CHAINLINK_FEE;
    address private CHAINLINK_TOKEN;

    address public contractOwner;

    event WorkAgreementCreated(
        uint256 indexed workAgreementId,
        address indexed proprietor
    );
    event WorkAgreementPaid(
        uint256 indexed workAgreementId,
        address indexed client
    );
    event WorkAgreementVerifierApproved(
        uint256 indexed workAgreementId,
        address indexed verifier
    );
    event DecryptionKeyUpdated(
        uint256 indexed workAgreementId,
        bytes decryptionKey
    );
    event FundsWithdrawn(
        uint256 indexed workAgreementId,
        address indexed proprietor
    );

    constructor(
        address _oracle,
        string memory _jobId,
        uint256 _fee,
        address _link
    ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(_link);
        ORACLE = _oracle;
        CHAINLINK_JOB = _jobId;
        CHAINLINK_FEE = _fee;
        contractOwner = msg.sender;
    }

    function updateOracleAddress(address _newOracle) public onlyOwner {
        ORACLE = _newOracle;
    }

    function stringToBytes32(
        string memory source
    ) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    function contractBalances()
        public
        view
        returns (uint256 eth, uint256 link)
    {
        eth = address(this).balance;

        LinkTokenInterface linkContract = LinkTokenInterface(
            chainlinkTokenAddress()
        );
        link = linkContract.balanceOf(address(this));
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer Link"
        );
    }

    function withdrawBalance() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Proprietor can create a new work agreement
    function createWorkAgreement(
        bytes32 _checksum,
        uint256 _price,
        address payable _client,
        address payable _verifier,
        string memory _ipfsCID
    ) public {
        workAgreementCount++;
        workAgreements[workAgreementCount] = WorkAgreement({
            checksum: _checksum,
            price: _price,
            proprietor: payable(msg.sender),
            client: _client,
            verifier: _verifier,
            paid: false,
            verifierApproved: _verifier == address(0),
            decryptionKey: "",
            ipfsCID: _ipfsCID
        });
        emit WorkAgreementCreated(workAgreementCount, msg.sender);
    }

    // Anyone can pay
    // TODO: should be able to make multiple payments
    function payWorkAgreement(uint256 _workAgreementId) public payable {
        WorkAgreement storage agreement = workAgreements[_workAgreementId];
        require(msg.value == agreement.price, "Incorrect payment amount");
        agreement.paid = true;
        emit WorkAgreementPaid(_workAgreementId, msg.sender);
    }

    // Optional third-party verifier can approve the work, one of the requirements for the proprietor to withdraw funds
    function approveWorkAgreement(uint256 _workAgreementId) public {
        WorkAgreement storage agreement = workAgreements[_workAgreementId];
        require(
            msg.sender == agreement.verifier,
            "Only the verifier can approve"
        );
        agreement.verifierApproved = true;
        emit WorkAgreementVerifierApproved(_workAgreementId, msg.sender);
    }

    // Proprietor uploads k which is passed to the Chainlink EA who fetches W from IPFS and unwraps it. The result is
    // hashed and compared to the stored checksum. The key is accepted if the hashes match.
    function updateDecryptionKey(
        uint256 _workAgreementId,
        bytes memory _decryptionKey
    ) public {
        WorkAgreement storage agreement = workAgreements[_workAgreementId];
        require(
            msg.sender == agreement.proprietor,
            "Only the proprietor can update the decryption key"
        );
        bytes32 requestId = fetchWorkHash(agreement.ipfsCID, _decryptionKey);
        requestIdToTempData[requestId] = TempData({
            workAgreementId: _workAgreementId,
            key: _decryptionKey
        });
    }

    function withdrawFunds(uint256 _workAgreementId) public {
        WorkAgreement storage agreement = workAgreements[_workAgreementId];
        require(
            msg.sender == agreement.proprietor,
            "Only the proprietor can withdraw funds"
        );
        require(agreement.paid, "Client has not paid");
        require(agreement.verifierApproved, "Verifier has not approved");
        // todo:
        // require(agreement.decryptionKey != "", "Decryption key not provided");
        uint256 amount = agreement.price;
        agreement.price = 0;
        agreement.proprietor.transfer(amount);
        emit FundsWithdrawn(_workAgreementId, msg.sender);
    }

    // Fetch the work hash from IPFS using Chainlink
    function fetchWorkHash(
        string memory ipfsCID,
        bytes memory decryptionKey
    ) public onlyOwner returns (bytes32 requestId) {
        Chainlink.Request memory req = buildOperatorRequest(
            stringToBytes32(CHAINLINK_JOB),
            this.fulfillWorkHash.selector
        );
        req.add("ipfs_cid", ipfsCID);
        req.addBytes("decryption_key", decryptionKey);
        requestId = sendChainlinkRequestTo(ORACLE, req, CHAINLINK_FEE);
    }

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration
    ) public onlyOwner {
        cancelChainlinkRequest(
            _requestId,
            _payment,
            _callbackFunctionId,
            _expiration
        );
    }

    // Receive the work hash from Chainlink
    function fulfillWorkHash(
        bytes32 _requestId,
        bytes32 _hash
    ) public recordChainlinkFulfillment(_requestId) {
        TempData storage tempData = requestIdToTempData[_requestId];
        WorkAgreement storage agreement = workAgreements[
            tempData.workAgreementId
        ];
        if (agreement.checksum == _hash) {
            agreement.decryptionKey = tempData.key;
            emit DecryptionKeyUpdated(
                tempData.workAgreementId,
                agreement.decryptionKey
            );
        }
        delete requestIdToTempData[_requestId];
    }
}
