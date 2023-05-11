import keccak256 from "keccak256";

export const encodeKeccak = (data: string): string => {
  return keccak256(data).toString("hex");
};
