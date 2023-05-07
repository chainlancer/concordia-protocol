import SHA3 from "sha3";

export const encodeSHA3 = (data: string): string => {
  const hash = new SHA3(256);
  const result = hash.update(data).digest("hex");
  return result;
};
