// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Lancer is ChainlinkClient, ConfirmedOwner {
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

    struct TempData {
        uint256 workAgreementId;
        bytes key;
    }

    mapping(bytes32 => TempData) private requestIdToTempData;

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
    event WorkAgreementDecryptionKeyUpdated(
        uint256 indexed workAgreementId,
        bytes decryptionKey
    );
    event WorkAgreementDecryptionKeyUpdateFailed(
        uint256 indexed workAgreementId,
        bytes invalidDecryptionKey
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

    function payWorkAgreement(uint256 _workAgreementId) public payable {
        WorkAgreement storage agreement = workAgreements[_workAgreementId];
        require(msg.value == agreement.price, "Incorrect payment amount");
        agreement.paid = true;
        emit WorkAgreementPaid(_workAgreementId, msg.sender);
    }

    function approveWorkAgreement(uint256 _workAgreementId) public {
        WorkAgreement storage agreement = workAgreements[_workAgreementId];
        require(
            msg.sender == agreement.verifier,
            "Only the verifier can approve"
        );
        agreement.verifierApproved = true;
        emit WorkAgreementVerifierApproved(_workAgreementId, msg.sender);
    }

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
        uint256 amount = agreement.price;
        agreement.price = 0;
        agreement.proprietor.transfer(amount);
        emit FundsWithdrawn(_workAgreementId, msg.sender);
    }

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
            emit WorkAgreementDecryptionKeyUpdated(
                tempData.workAgreementId,
                agreement.decryptionKey
            );
        } else {
            emit WorkAgreementDecryptionKeyUpdateFailed(
                tempData.workAgreementId,
                tempData.key
            );
        }
        delete requestIdToTempData[_requestId];
    }
}
