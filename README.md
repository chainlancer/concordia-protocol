# Concordia Solidity Contracts
Concordia is a decentralized protocol leveraging blockchain technology to enable trustless atomic swaps of digital work between workers and clients.

## Overview

_a high level overview of Concordia's architecture_

### How?

#### Creating a Concord

To create an encrypted deliverable (w_k) the proprietor uses AES encryption along with a 32-byte secret key (k) and the deliverable (w). It is recommended that w is encrypted with the public key of the client **prior to encrypting it with the secret key.** Although this step isn't exactly necessary, it prevents others from decrypting its contents after the key is submitted.

W is pinned on the InterPlanetary File System (IPFS) returning a unique CID.

To validate the key programmatically we need to create a simple proof with a checksum. The Proprietor can create a checksum (c) by keccak256 hashing w and k, packing the results into a single byte array with no padding, and hashing the result once more.

To keep the key from being exposed to the client prematurely, the Proprietor must use the public key on the Concordia contract to encode it (k_p).

Finally, the Proprietor can use k_p, c, and the cid to submit a transaction to create a "concord" on chain.

#### Payment

Once the client pays the concord in full, the cid and k_p are passed to the oracle.

The oracle decodes the k_p with the private key counterpart to the public key on the contract.

The oracle uses k to decode w_k and obtain w.

The oracle then hashes w with keccak256 (H(w)).

The Oracle submits a transaction to return H(w) and k to the contract.

The smart contract hashes k, packs its result with H(w) into a single byte array and hashes that using the keccak256 hash function. If the result matches c, the key is accepted, and the funds are withdrawable.

#### Decrypting the Deliverable

The client can decrypt the encrypted work bundle (w_k) using the decryption key (k) - and their wallet public key (p) if needed - to obtain the completed work (w).

This process ensures the protection of both parties, with payment released only when the work is completed as agreed upon.

#### As Notation

1. w_k = AES_k(AES_pub(w))
2. CID = pin w on IPFS
3. c = keccak256(pack(keccak256(w), keccak256(k)))
4. k_p = encode_pub_concordia(k)
5. submitTransaction(k_p, c, CID)
6. verifyPayment(CID, k_p)
7. k = decode_priv(k_p)
8. w = AES^-1_k(w_k)
9. if (keccak256(pack(keccak256(k), keccak256(w))) == c) then accept k, allow withdrawal
10. w = AES^-1_k(AES^-1_p(w_k))

**where:**

- w_k represents the encrypted deliverable
- AES_k and AES_pub are the AES encryption functions with secret key and public key respectively
- w is the deliverable
- CID represents the unique Content Identifier returned from IPFS
- keccak256 is the keccak256 hash function
- pack represents the operation of packing results into a single byte array with no padding
- k_p represents the encoded secret key
- encode_pub_concordia and decode_priv are the encoding and decoding functions using the public key on the Concordia contract and its private counterpart respectively
- AES^-1_k and AES^-1_p are the AES decryption functions with secret key and public key respectively

## Development

_all of our testing will be done on the sepolia testnet since it is cumbersome to test chainlink functionality locally_

### Contracts

the following contracts must be deployed:

- [Operator](#operator)
- [Concordia](#concordia)

#### Operator

_An Operator contract is required to securely and efficiently manage communication between a Chainlink external adapter and the Chainlink node. It defines rules for job management, payment, and security, ensuring the integrity of the network._

```bash
# deploy operator contract
$ yarn --cwd sol npx hardhat run scripts/operator/deploy.ts --network sepolia

# set authorized senders (TODO)
$ yarn --cwd sol npx hardhat operatorSetAuthorizedSenders --network sepolia
```

#### Concordia

**DEPRECATED AS OF 05/15/23**

_The Concordia contract facilitates the creation, payment, approval, and updates of concords._

```bash
# deploy concordia contract
$ yarn sol deploy-concordia

# create concord
$ yarn sol hardhat create --cid DELIVERABLE_IPFS_CID --checksum CHECKSUM --secret-key ENCRYPTED_SECRET_KEY$ yarn sol hardhat create --cid DELIVERABLE_IPFS_CID --checksum CHECKSUM --secret-key ENCRYPTED_SECRET_KEY

# pay for concord
$ yarn sol pay --id CONCORD_ID

# request finalization
$ yarn sol request-finalization --id CONCORD_ID

# get concord by id
$ yarn sol get-concord-by-id --id CONCORD_ID
```

**try this demo**

first, deploy a fresh contract:

```bash
$ yarn sol deploy-concordia
```

then update the .env with the new contract address.

let's assume that our deliverable (w) is simply, "Hello World!" and we're using a 16-byte key (k), "207109403456bdad4a9711d9f40aebff"

create a checksum for our deliverable, keccak256(encodePacked(keccak256(w), keccak256(k)))
> packed: ed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd0ae45eb4d1bd2f37f1bbfc80f948d33c126fb78b894c7afa4af0b15e226e155a
> checksum: 781114df28046b62aff59bb46bab2d5ad1eb4a8171ac4407a083737a998796a3

using asym encryption, encrypt k with public key on contract
> encrypted key: 8e4640c39847bf441cab0871cea163a40318c8ce6f3f636bd7cf095d1ced2b66a5ab9a8f3e644b4b9281c839f89cf97a38e73362d60e545980a213614b7290f37df4884413f0d62d8dd59e0f1ca94b34aea8add876d51d74db8752d208107f6956bac11c76da635577782777d7f607c2fc4ef9281a0be46c4c154bd54d85630fa0

use AES encryption to encrypt w with k to get w_k, "207109403456bdad4a9711d9f40aebff"
> encrypted content: d87e3eed86bfed5ffae1784705cdc845c4438e97707077cb4897e605cd917012

pin encrypted content on IPFS and get CID
> CID: QmaWqJtRuZcXKdzY1DRfAGLarPDvmjUJDVZ5zeyjeMWKR3

okay now we can create a concord. note that default buyer is concord creator and default price is 0

```bash
$ yarn sol hardhat create --cid QmaWqJtRuZcXKdzY1DRfAGLarPDvmjUJDVZ5zeyjeMWKR3 \ 
    --checksum 781114df28046b62aff59bb46bab2d5ad1eb4a8171ac4407a083737a998796a3 \
    --secret-key 8e4640c39847bf441cab0871cea163a40318c8ce6f3f636bd7cf095d1ced2b66a5ab9a8f3e644b4b9281c839f89cf97a38e73362d60e545980a213614b7290f37df4884413f0d62d8dd59e0f1ca94b34aea8add876d51d74db8752d208107f6956bac11c76da635577782777d7f607c2fc4ef9281a0be46c4c154bd54d85630fa0
```
> concord id: 1

next, we can pay for our concord

```bash
$ yarn sol hardhat pay --id 1
```

now that client has paid we can finalize the agreement to unlock the funds

```bash
$ yarn sol hardhat request-finalization --id 1
```

get concord

```bash
$ yarn sol hardhat get-concord-by-id --id 1
```
> 
res: [
  BigNumber { value: "1684159128" },
  BigNumber { value: "1684159224" },
  BigNumber { value: "0" },
  '0x781114df28046b62aff59bb46bab2d5ad1eb4a8171ac4407a083737a998796a3',
  '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
  '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
  '0x0000000000000000000000000000000000000000',
  true,
  true,
  '0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff',
  'QmaWqJtRuZcXKdzY1DRfAGLarPDvmjUJDVZ5zeyjeMWKR3',
  'QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi',
  createdAt: BigNumber { value: "1684159128" },
  updatedAt: BigNumber { value: "1684159224" },
  price: BigNumber { value: "0" },
  checksum: '0x781114df28046b62aff59bb46bab2d5ad1eb4a8171ac4407a083737a998796a3',
  proposer: '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
  buyer: '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
  arbiter: '0x0000000000000000000000000000000000000000',
  arbiterApproved: true,
  paid: true,
  secretKey: '0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff',
  deliverableIpfsCID: 'QmaWqJtRuZcXKdzY1DRfAGLarPDvmjUJDVZ5zeyjeMWKR3',
  metadataIpfsCID: 'QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi'
]
fetch the content from IPFS and decrypt using the decryption key

```bash
$ curl https://concordia.mypinata.cloud/ipfs/QmUq9f7XoCyJDrkXJjgcNAKkqaTs3iqAr31cuug639oYdq
```
> d87e3eed86bfed5ffae1784705cdc845c4438e97707077cb4897e605cd917012

_decrypt with AES_
> Hello World!

## Chainlink

A Chainlink external adapter is necessary for the [encryption process](#overview).

### Deployment

in order to integrate with Chainlink we need to deploy some services:

- [Chainlink Node](#chainlink-node)
- [PostgreSQL](#postgresql)
- [External Adapter](#external-adapter)

#### Chainlink Node

_A Chainlink external adapter needs a Chainlink node to validate and process the data retrieved by the adapter. The node also handles job management and execution, which the adapter cannot perform alone._

##### Deployment

```bash
# deploy sepolia chainlink node
$ kubectl apply -f deployments/sepolia/k8s/clr-ea-node.yml
```

##### Interaction

```bash
# port forward
$ kubectl port-forward service/clr-ea-node 6688:6688
```

navigate to http://localhost:6688/ in browser and sign in with secrets from k8s

#### PostgreSQL

_Chainlink node uses a PostgreSQL database to store job metadata, configuration, security settings, and state information._

##### Deployment

https://bitnami.com/stack/postgresql/helm

##### Interaction

```bash
# get password from k8s secrets
$ export POSTGRES_PASSWORD=$(kubectl get secret --namespace default clr-ea-pg-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)

# connect to db
$ kubectl run clr-ea-pg-postgresql-client --rm --tty -i --restart='Never' --namespace default --image docker.io/bitnami/postgresql:15.2.0-debian-11-r26 --env="PGPASSWORD=$POSTGRES_PASSWORD" --command -- psql --host clr-ea-pg-postgresql -U postgres -d postgres -p 5432

# connect from outside cluster
$ kubectl port-forward --namespace default svc/clr-ea-pg-postgresql 5432:5432 & PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 543
```

#### External Adapter

_the external adapter is an API service that fetches work bundles from IPFS, decodes them using a provided secret key, and finally returns a hash to the contract that can be used to compare against the concord's checksum_

##### Deployment

_ci/cd coming soon_

```bash
# build (ignore build error)
$ make ea-build

# bump version
$ make bumpversion-patch

# build image
$ make ea-docker-build

# push image to gcr
$ make ea-docker-push

# deploy ea service
$ make ea-deploy-sepolia
```

##### Interaction

```bash
# get service
$ kubectl get svc/clr-ea-services

# check health
$ curl http://<EXTERNAL-IP>:8080/health
```

**or using port forwarding**

```bash
# port forward
$ kubectl port-forward service/clr-ea-services 8080:8080

# check health
$ curl http://localhost:8080/health
```