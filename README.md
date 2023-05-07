# Lancer Solidity Contracts
Lancer is a decentralized protocol leveraging blockchain technology to enable trustless atomic swaps of digital work between workers and clients.

## Overview

_a high level overview of Lancer's architecture_

### How?

The freelancer (proprietor) completes the work and creates an encrypted work bundle (W) by combining the decryption key (k), client's wallet public key (p), and the work bundle (w). The encrypted work bundle is then uploaded to the InterPlanetary File System (IPFS).

Once the client pays the contract in full, the freelancer provides the contract with the decryption key (k).

The smart contract calls a Chainlink External Adapter (EA) to fetch the encrypted work bundle (W) from IPFS.

The Chainlink EA uses the decryption key (k) to unwrap the encrypted work bundle (W) and obtain the original work package (w_p).

The Chainlink EA then hashes the work package (w_p) using the SHA3-256 algorithm and returns the result (H(w_p)) to the smart contract.

The smart contract compares the work agreement checksum (c) with the hashed work package (H(w_p)). If the two values match, the key is accepted, and the agreement is marked as "paid."

The client can decrypt the encrypted work bundle (W) using the decryption key (k) and their wallet public key (p) to obtain the completed work (w).

This process ensures the protection of both parties, with payment released only when the work is completed as agreed upon. The integration with Chainlink allows the Lancer protocol to securely and reliably fetch and process off-chain data, further enhancing its functionality and security.

**or as notation**

1. W = E(k, w⊕p)
2. Client ⟶ Payment ⟶ Contract
3. Proprietor ⟶ k ⟶ Contract
4. Contract ⟶ Chainlink EA ⟶ W (from IPFS)
5. w_p = D(k, W)
6. H(w_p) =? c
7. If H(w_p) = c, mark Agreement as "paid"
8. w = w_p⊕p

**where:**

- W represents the encrypted work bundle
- E is the encryption function
- k is the decryption key
- w is the work bundle
- p is the client's wallet public key
- ⊕ represents the XOR operation
- D is the decryption function
- w_p is the work package containing the original work and the client's public key
- H is the SHA3-256 hash function
- c is the work agreement checksum

## Development

_all of our testing will be done on the sepolia testnet since it is cumbersome to test chainlink functionality locally_

### Contracts

the following contracts must be deployed:

- [Operator](#operator)
- [Lancer](#lancer)

#### Operator

_An Operator contract is required to securely and efficiently manage communication between a Chainlink external adapter and the Chainlink node. It defines rules for job management, payment, and security, ensuring the integrity of the network._

```bash
# deploy operator contract
$ npx hardhat run scripts/operator/deploy.ts --network sepolia

# set authorized senders (TODO)
$ npx hardhat operatorSetAuthorizedSenders --network sepolia
```

#### Lancer

_The Lancer contract facilitates the creation, payment, approval, and updates of work agreements._

```bash
# deploy lancer contract
$ yarn --cwd sol npx hardhat scripts/lancer/deploy.ts --network sepolia

# create work agreement
$ yarn --cwd sol npx hardhat lancerCreateWorkAgreement --cid IPFS_CID --checksum CHECKSUM --network sepolia

# pay for work agreement
$ yarn --cwd sol npx hardhat lancerPayWorkAgreement --wid WORK_AGREEMENT_ID --network sepolia

# update decryption key for work agreement
$ yarn --cwd sol npx hardhat lancerUpdateDecryptionKey --network sepolia

# get work agreement by id
$ yarn --cwd sol npx hardhat lancerWorkAgreements --wid WORK_AGREEMENT_ID --network sepolia
```

**try this demo**

first, deploy a fresh contract:

```bash
$ yarn --cwd sol npx hardhat scripts/lancer/deploy.ts --network sepolia
```

let's assume that our content is simply, "Hello World!" and we're using a 16-byte key, "207109403456bdad4a9711d9f40aebff"

create a checksum our content, "Hello World!" with the SHA3_256 algorithm:
>> checksum: d0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af

use AES encoding to encode your content with our key, "207109403456bdad4a9711d9f40aebff"
>> encrypted content: d87e3eed86bfed5ffae1784705cdc845c4438e97707077cb4897e605cd917012

pin encrypted content on IPFS and get CID
>> CID: QmUq9f7XoCyJDrkXJjgcNAKkqaTs3iqAr31cuug639oYdq

okay now we can create a work agreement. note that default buyer is work agreement creator and default price is 0

```bash
$ yarn --cwd sol npx hardhat lancerCreateWorkAgreement --cid QmUq9f7XoCyJDrkXJjgcNAKkqaTs3iqAr31cuug639oYdq --checksum d0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af --network sepolia
```
>> work agreement id: 1

next, we can pay for our work agreement

```bash
$ yarn --cwd sol npx hardhat lancerPayWorkAgreement --wid 1 --network sepolia
```

now that the agreement is paid we can pass in our decryption key to withdraw the funds. note that the default price
was 0 so there will be no funds in the agreement

```bash
$ yarn --cwd sol npx hardhat lancerUpdateDecryptionKey --wid 1 --key 207109403456bdad4a9711d9f40aebff --network sepolia
```

get work agreement

```bash
$ yarn --cwd sol npx hardhat lancerWorkAgreements --wid 1 --network sepolia
```

>> work agreement: [
        '0xd0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af',
        BigNumber { value: "0" },
        '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
        '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
        '0x0000000000000000000000000000000000000000',
        true,
        true,
        '0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff',
        'QmUq9f7XoCyJDrkXJjgcNAKkqaTs3iqAr31cuug639oYdq',
        checksum: '0xd0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af',
        price: BigNumber { value: "0" },
        proprietor: '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
        client: '0x744e054a911A89938B0f88043e14bE48A0f8BEc9',
        verifier: '0x0000000000000000000000000000000000000000',
        paid: true,
        verifierApproved: true,
        decryptionKey: '0x00000000000000000000000000000000207109403456bdad4a9711d9f40aebff',
        ipfsCID: 'QmUq9f7XoCyJDrkXJjgcNAKkqaTs3iqAr31cuug639oYdq'
    ]

fetch the content from IPFS and decrypt using the decryption key

```bash
$ curl https://lancer.mypinata.cloud/ipfs/QmUq9f7XoCyJDrkXJjgcNAKkqaTs3iqAr31cuug639oYdq
```
>> d87e3eed86bfed5ffae1784705cdc845c4438e97707077cb4897e605cd917012

_decrypt with AES_
>> Hello World!

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

_the external adapter is an API service that fetches work bundles from IPFS, decodes them using a provided secret key, and finally returns a hash to the contract that can be used to compare against the work agreement's checksum_

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