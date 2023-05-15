// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/// TODO:
/// "work" should be renamed to "deliverable" or something similar
///
/// known exploits:
/// after the proposer submits the key there's a short window that the buyer can withdraw their funds and simply not pay
/// - one solution to this is to lock the funds until the key is verified; however, in the instance that there is an
///   issue with the external adapter, the funds would be locked forever. we could add a timeout to the lock, but then
///   the buyer could simply wait until the timeout is reached and withdraw their funds.
///      - potential solution, in addition to the lock and timeout, we add a public key to the contract that
///        should be used to encrypt decryption keys. the external adapter could then decrypt the key and generate a hash
///        of the decrypted deliverable. then it would pass both the hash and the key to the contract - unlocking the funds
///        only if the hash matches the one stored in the contract. the external adapter doesn't really expose anything if
///        it is compromised. they would need to know the private key of the buyer to decrypt the deliverable
///
/// deploy a cluster of contracts to make it more secure?

/// with this refactor, we can simply encrypt the key with the public key of the contract as well as the deliverable

contract Concordia is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // TODO:
    // createdAt and updatedAt can probably use a type smaller than uint256
    // ipfsWorkCID and ipfsMetadataCID can probably use a type smaller than string
    struct Concord {
        uint256 createdAt;
        uint256 updatedAt;
        uint96 price;
        // h(h(deliverable), h(key)) - hashing the deliverable and key ensures that that the external adapter
        // must have the correct values.
        bytes32 checksum;
        address proposer;
        address buyer;
        address arbiter;
        bool arbiterApproved;
        bool paid;
        bytes secretKey; // key encrypted with the public key of the contract
        string deliverableIpfsCID;
        string metadataIpfsCID;
    }

    mapping(uint256 => Concord) public concords;
    uint256 public concordCount;

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
    event KeyUpdated(
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

    function create(
        address payable _buyer,
        address payable _arbiter,
        uint96 _price,
        bytes32 _checksum,
        string memory _ipfsWorkCID,
        string memory _ipfsMetadataCID,
        bytes memory _secretKey
    ) public {
        concordCount++;

        Concord memory wa = Concord({
            proposer: msg.sender,
            buyer: _buyer,
            arbiter: _arbiter,
            checksum: _checksum,
            price: _price,
            arbiterApproved: _arbiter == address(0),
            deliverableIpfsCID: _ipfsWorkCID,
            metadataIpfsCID: _ipfsMetadataCID,
            secretKey: _secretKey, // key to decrypt the deliverable, encrypted with public key of contract
            paid: false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        concords[concordCount] = wa;

        // Add work c ID to the respective proposer and buyer mappings
        _proposerConcordIds[msg.sender].push(concordCount);
        _buyerConcordIds[_buyer].push(concordCount);

        emit Created(concordCount, msg.sender);
    }

    // TODO
    // function pay(bool _finalize)
    function pay(uint256 _id) public payable {
        Concord storage c = concords[_id];

        require(msg.value == c.price, "Incorrect payment amount");

        c.paid = true;
        c.updatedAt = block.timestamp; // Update the updatedAt field

        emit Paid(_id, msg.sender);
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

        require(c.paid, "Client has not paid");
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
            emit KeyUpdated(id, _key, false);
            return;
        }

        c.secretKey = _key;
        c.updatedAt = block.timestamp;

        delete requestIdToConcordId[_requestId];

        emit KeyUpdated(id, c.secretKey, true);
    }

    // TODO: implement a way to lock funds
    function withdrawFunds(uint256 _id) public {
        Concord storage c = concords[_id];

        require(
            msg.sender == c.proposer,
            "Only the proposer can withdraw funds"
        );
        require(c.paid, "Client has not paid");
        require(c.arbiterApproved, "Arbiter has not approved");

        uint256 amount = c.price;

        c.price = 0;
        c.updatedAt = block.timestamp;

        payable(c.proposer).transfer(amount);

        emit FundsWithdrawn(_id, msg.sender);
    }
}
