// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

// TODO:
// implement fund lock funds while contract is being fulfilled
// implement concord cancellation
// implement concord expiration
// implement buyer refund

// todo: we should remove arbiterApproved and instead use a status enum... concords should default to PendingApproval
// and then the arbiter can approve or reject the concord. if there is no arbiter, then the concord is automatically
// approved

contract Concordia is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    enum Status {
        Unpaid,
        Paid,
        Fulfilled,
        FundsWithdrawn
    }

    // TODO:
    // createdAt and updatedAt can probably use a type smaller than uint256
    // ipfsWorkCID and ipfsMetadataCID can probably use a type smaller than string
    struct Concord {
        uint256 createdAt;
        uint256 updatedAt;
        bytes32 checksum;
        address proposer;
        address buyer;
        address arbiter;
        uint96 price;
        Status status;
        bool arbiterApproved;
        bytes secretKey; // encoded with contract pub key
        bytes decryptionKey;
        bytes arbiterSecretKey; // encoded with arbiter pub key
        string deliverableIpfsCID;
        string metadataIpfsCID;
    }

    mapping(uint256 => Concord) public concords;
    uint256 public concordCount;

    mapping(address => uint256[]) private _arbiterConcordIds;

    function arbiterConcordIds(
        address addr
    ) public view returns (uint256[] memory) {
        return _arbiterConcordIds[addr];
    }

    mapping(address => uint256[]) private _proposerConcordIds;

    function proposerConcordIds(
        address addr
    ) public view returns (uint256[] memory) {
        return _proposerConcordIds[addr];
    }

    mapping(address => uint256[]) public _buyerConcordIds;

    function buyerConcordIds(
        address addr
    ) public view returns (uint256[] memory) {
        return _buyerConcordIds[addr];
    }

    mapping(bytes32 => uint256) private requestIdToConcordId;

    address private oracle;
    string private chainlinkJob;
    uint256 private chainlinkFee;
    address private chainlinkToken;
    bytes public publicKey;
    address public contractOwner;

    event Created(uint256 indexed concordId, address indexed proposer);
    event Paid(uint256 indexed concordId, address indexed buyer);
    event Approved(uint256 indexed concordId, address indexed arbiter);
    event Fulfilled(
        uint256 indexed concordId,
        bytes decryptionKey,
        bool success
    );
    event FundsWithdrawn(uint256 indexed concordId, address indexed proposer);

    // TESTING
    event ExternalAdapterArgs(
        bytes32 indexed checksum,
        bytes32 indexed challenge_checksum
    );

    constructor(
        address _oracle,
        string memory _jobId,
        uint256 _fee,
        address _link,
        bytes memory _publicKey
    ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(_link);
        oracle = _oracle;
        chainlinkJob = _jobId;
        chainlinkFee = _fee;
        contractOwner = msg.sender;
        publicKey = _publicKey;
    }

    function updateOracleAddress(address _newOracle) public onlyOwner {
        oracle = _newOracle;
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

    function create(
        address payable _buyer,
        address payable _arbiter,
        uint96 _price,
        bytes32 _checksum,
        string memory _ipfsWorkCID,
        string memory _ipfsMetadataCID,
        bytes memory _secretKey,
        bytes memory _arbiterSecretKey
    ) public {
        concordCount++;

        Concord memory wa = Concord({
            proposer: msg.sender,
            buyer: _buyer,
            arbiter: _arbiter,
            checksum: _checksum,
            price: _price,
            arbiterApproved: _arbiter == address(0),
            status: Status.Unpaid,
            deliverableIpfsCID: _ipfsWorkCID,
            metadataIpfsCID: _ipfsMetadataCID,
            secretKey: _secretKey,
            decryptionKey: "",
            arbiterSecretKey: _arbiterSecretKey,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        concords[concordCount] = wa;

        // add to mappings
        _proposerConcordIds[msg.sender].push(concordCount);
        _buyerConcordIds[_buyer].push(concordCount);
        if (_arbiter != address(0)) {
            _arbiterConcordIds[_arbiter].push(concordCount);
        }

        emit Created(concordCount, msg.sender);
    }

    function pay(uint256 _id, bool shouldFinalize) public payable {
        Concord storage c = concords[_id];

        require(c.status == Status.Unpaid, "Already paid");
        require(msg.value == c.price, "Incorrect payment amount");

        c.status = Status.Paid;
        c.updatedAt = block.timestamp; // Update the updatedAt field

        emit Paid(_id, msg.sender);

        if (shouldFinalize) {
            requestFinalization(_id);
        }
    }

    function approve(uint256 _id) public {
        Concord storage c = concords[_id];

        require(msg.sender == c.arbiter, "Only the arbiter can approve");

        c.arbiterApproved = true;
        c.updatedAt = block.timestamp;

        emit Approved(_id, msg.sender);
    }

    // anyone can finalize the concord once conditions are met
    function requestFinalization(uint256 _id) public {
        Concord storage c = concords[_id];

        require(c.status == Status.Paid, "Must pay first");
        require(c.arbiterApproved, "Arbiter has not approved");

        Chainlink.Request memory req = buildOperatorRequest(
            stringToBytes32(chainlinkJob),
            this.fulfillFinalization.selector
        );

        req.add("deliverable_ipfs_cid", c.deliverableIpfsCID);
        req.addBytes("secret_key", c.secretKey);

        bytes32 requestId = sendChainlinkRequestTo(oracle, req, chainlinkFee);

        requestIdToConcordId[requestId] = _id;
    }

    function fulfillFinalization(
        bytes32 _requestId,
        bytes32 _deliverableHash,
        bytes memory _key
    ) public recordChainlinkFulfillment(_requestId) {
        uint256 id = requestIdToConcordId[_requestId];
        Concord storage c = concords[id];

        bytes32 keyHash = keccak256(_key);
        bytes32 checksum = keccak256(
            abi.encodePacked(_deliverableHash, keyHash)
        );

        emit ExternalAdapterArgs(c.checksum, checksum);

        if (checksum != c.checksum) {
            emit Fulfilled(id, _key, false);
            return;
        }

        c.decryptionKey = _key;
        c.updatedAt = block.timestamp;
        c.status = Status.Fulfilled;

        delete requestIdToConcordId[_requestId];

        emit Fulfilled(id, c.secretKey, true);
    }

    // TODO: implement a way to lock funds
    function withdrawFunds(uint256 _id) public {
        Concord storage c = concords[_id];

        require(
            msg.sender == c.proposer,
            "Only the proposer can withdraw funds"
        );
        require(c.status == Status.Fulfilled, "Concord is not Fulfilled");
        require(c.arbiterApproved, "Arbiter has not approved");

        uint256 amount = c.price;

        c.price = 0;
        c.updatedAt = block.timestamp;
        c.status = Status.FundsWithdrawn;

        payable(c.proposer).transfer(amount);

        emit FundsWithdrawn(_id, msg.sender);
    }
}
