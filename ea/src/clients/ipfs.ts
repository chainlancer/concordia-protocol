import config from "../../../config";

// todo: get from env
const IPFS_HOST = "https://gateway.ipfs.io/ipfs";
// const IPFS_API_KEY =
//   "fCv6Kvdxr01vxY-vTyd1GKYLOtWifdnbAiT76kQS8lIafwV6ND9sy9q5U3R0osI";

// Function to make a GET request using fetch to fetch a file from a private IPFS gateway
export async function fetchDataFromIPFS(hash: string) {
  try {
    const url = `${IPFS_HOST}/ipfs/${hash}`;

    // const response = await fetch(url, {
    //   headers: {
    //     Authorization: `Bearer ${IPFS_API_KEY}}`,
    //   },
    // });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error fetching file from IPFS:", error);
  }
}
