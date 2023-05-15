import hre from "hardhat";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { encodeKeccak } from "../../lib/src/keccak";
import { encodePacked } from "../../lib/src/helpers";

describe("Checksums and keccak256", () => {
  if (hre.network.name !== "hardhat") return;

  let checksumContract: Contract;
  let owner: Signer;
  let client: Signer;

  const deliverableHash =
    "ed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd";
  const key = "207109403456bdad4a9711d9f40aebff";

  const deliverableHashBytes = "0x" + deliverableHash;
  const keyBytes = "0x" + key;

  // const paddedKeyByes =
  // "0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff";

  beforeEach(async () => {
    [owner, client] = await ethers.getSigners();

    // deploy contract
    const ChecksumContractFactory = await ethers.getContractFactory("Checksum");
    checksumContract = await ChecksumContractFactory.deploy();
    await checksumContract.deployed();
  });

  // 0x prefix: yes
  // encodeKeccak in JS removes 0x prefix
  // padding:
  it("should be able to create matching checksums in js and solidity", async () => {
    // const keyHashJS = encodeKeccak(keyBytes);
    // console.log("key hash js", keyHashJS);

    // const keyHashSolidity = await checksumContract
    //   .connect(owner)
    //   .keccak(keyBytes);
    // console.log("key hash solidity", keyHashSolidity);

    // const keyHash = encodeKeccak("0x207109403456bdad4a9711d9f40aebff");
    // console.log("keyHash", keyHash);

    const paddedKeyHashBytes = encodeKeccak(
      "0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff"
    );
    console.log("paddedKeyHash", paddedKeyHashBytes);

    // const checksumJs = encodeAndHash(deliverableHashBytes, paddedKeyHashBytes);
    // console.log("checksum javascript:", checksumJs);

    // const checksumSolidity = await checksumContract
    //   .connect(owner)
    //   .checksum(deliverableHashBytes, "0x" + paddedKeyHashBytes);
    // console.log("checksum solidtiy", checksumSolidity);

    const packedJS = encodePacked(deliverableHashBytes, paddedKeyHashBytes);
    console.log("packedJS", packedJS);

    const packedSolidity = await checksumContract
      .connect(owner)
      .pack(
        deliverableHashBytes,
        "0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff"
      );
    console.log("packedSolidity", packedSolidity);
  });

  // it("test keccak256 with key bytes", async () => {
  //   const res = await keccakTestContract.connect(owner).keccak(keyBytes);
  //   console.log(res);
  // });

  // it("test keccak256 with padded key bytes", async () => {
  //   const res = await keccakTestContract.connect(owner).keccak(paddedKeyByes);
  //   console.log(res);
  // });

  // it("test keccak256 with deliverable hash bytes", async () => {
  //   const res = await keccakTestContract
  //     .connect(owner)
  //     .keccak(deliverableHashBytes);
  //   console.log(res);
  // });
});
