// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

// TODO:
// "work" should be renamed to "deliverable" or something similar

contract Concordia is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // TODO:
    // createdAt and updatedAt can probably use a type smaller than uint256
    // ipfsWorkCID and ipfsMetadataCID can probably use a type smaller than string
    struct Concord {
        uint256 createdAt;
        uint256 updatedAt;
        uint96 price;
        bytes32 checksum; // SHA256 checksum of the work
        address proprietor; // Proprietor is the creator of the work
        address client; // Client is the buyer of the work
        address verifier; // Verifier is the third party that verifies the work
        bool verifierApproved; // Whether the verifier has approved the work
        bool paid; // Whether the client has paid for the work
        bytes decryptionKey; // Decryption key for the work
        string deliverableIpfsCID; // CID of the encrypted work
        string metadataIpfsCID; // CID of the agreement metadata
    }

    mapping(uint256 => Concord) public concords;
    uint256 public concordCount;

    mapping(address => uint256[]) private _proprietorConcords;

    function proprietorConcords(
        address addr
    ) public view returns (uint256[] memory) {
        return _proprietorConcords[addr];
    }

    mapping(address => uint256[]) public _clientConcords;

    function clientConcords(
        address addr
    ) public view returns (uint256[] memory) {
        return _clientConcords[addr];
    }

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

    event ConcordCreated(
        uint256 indexed workAgreementId,
        address indexed proprietor
    );
    event ConcordPaid(uint256 indexed workAgreementId, address indexed client);
    event ConcordApproved(
        uint256 indexed workAgreementId,
        address indexed verifier
    );
    event ConcordKeyUpdated(
        uint256 indexed workAgreementId,
        bytes decryptionKey
    );
    event ConcordKeyUpdateFailed(
        uint256 indexed workAgreementId,
        bytes invalidDecryptionKey
    );
    event ConcordFundsWithdrawn(
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

    function createConcord(
        address payable _client,
        address payable _verifier,
        uint96 _price,
        bytes32 _checksum,
        string memory _ipfsWorkCID,
        string memory _ipfsMetadataCID
    ) public {
        concordCount++;

        Concord memory wa = Concord({
            proprietor: msg.sender,
            client: _client,
            price: _price,
            deliverableIpfsCID: _ipfsWorkCID,
            metadataIpfsCID: _ipfsMetadataCID,
            checksum: _checksum,
            verifier: _verifier,
            verifierApproved: _verifier == address(0),
            paid: false,
            decryptionKey: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        concords[concordCount] = wa;

        // Add work agreement ID to the respective proprietor and client mappings
        _proprietorConcords[msg.sender].push(concordCount);
        _clientConcords[_client].push(concordCount);

        emit ConcordCreated(concordCount, msg.sender);
    }

    function payConcord(uint256 _workAgreementId) public payable {
        Concord storage agreement = concords[_workAgreementId];
        require(msg.value == agreement.price, "Incorrect payment amount");
        agreement.paid = true;
        agreement.updatedAt = block.timestamp; // Update the updatedAt field
        emit ConcordPaid(_workAgreementId, msg.sender);
    }

    function approveConcord(uint256 _workAgreementId) public {
        Concord storage agreement = concords[_workAgreementId];
        require(
            msg.sender == agreement.verifier,
            "Only the verifier can approve"
        );
        agreement.verifierApproved = true;
        agreement.updatedAt = block.timestamp;
        emit ConcordApproved(_workAgreementId, msg.sender);
    }

    function submitKey(
        uint256 _workAgreementId,
        bytes memory _decryptionKey
    ) public {
        Concord storage agreement = concords[_workAgreementId];
        require(
            msg.sender == agreement.proprietor,
            "Only the proprietor can update the decryption key"
        );
        bytes32 requestId = verifyKey(
            agreement.deliverableIpfsCID,
            _decryptionKey
        );
        requestIdToTempData[requestId] = TempData({
            workAgreementId: _workAgreementId,
            key: _decryptionKey
        });
    }

    function withdrawFunds(uint256 _workAgreementId) public {
        Concord storage agreement = concords[_workAgreementId];
        require(
            msg.sender == agreement.proprietor,
            "Only the proprietor can withdraw funds"
        );
        require(agreement.paid, "Client has not paid");
        require(agreement.verifierApproved, "Verifier has not approved");
        uint256 amount = agreement.price;

        agreement.price = 0;
        agreement.updatedAt = block.timestamp;
        payable(agreement.proprietor).transfer(amount);
        emit ConcordFundsWithdrawn(_workAgreementId, msg.sender);
    }

    function verifyKey(
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

    function fulfillVerifyKey(
        bytes32 _requestId,
        bytes32 _hash
    ) public recordChainlinkFulfillment(_requestId) {
        TempData storage tempData = requestIdToTempData[_requestId];
        Concord storage agreement = concords[tempData.workAgreementId];
        emit CompareChecksumAndHash(agreement.checksum, _hash);
        if (agreement.checksum == _hash) {
            agreement.decryptionKey = tempData.key;
            agreement.updatedAt = block.timestamp;
            emit ConcordKeyUpdated(
                tempData.workAgreementId,
                agreement.decryptionKey
            );
        } else {
            agreement.updatedAt = block.timestamp;
            emit ConcordKeyUpdateFailed(tempData.workAgreementId, tempData.key);
        }
        delete requestIdToTempData[_requestId];
    }
}
