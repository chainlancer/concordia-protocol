import { ethers } from "ethers";

// this function emulates solidity's api.encodePacked function
export function encodePacked(...values: any[]) {
  let packedData = "";
  for (const value of values) {
    if (typeof value === "string") {
      packedData += value.replace(/^0x/i, "");
    } else if (typeof value === "number") {
      const hexValue = ethers.utils.hexlify(value);
      packedData += hexValue.replace(/^0x/i, "");
    } else {
      throw new Error("Unsupported value type");
    }
  }
  return packedData;
}

export function padKey(key: string): string {
  // each byte is represented by 2 hexadecimal characters, so 32 bytes are 64 characters
  return key.padStart(64, "0");
}
